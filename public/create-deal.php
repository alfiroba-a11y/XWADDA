<?php
declare(strict_types=1);
require __DIR__ . '/app-loader.php';
$user=require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('POST required.'); }
verify_csrf();
$title=trim((string)($_POST['title']??''));
$sellerEmail=strtolower(trim((string)($_POST['seller_email']??'')));
$terms=trim((string)($_POST['terms']??''));
$amount=(string)($_POST['amount']??'');
$currency=(string)($_POST['currency']??'KES');
if (mb_strlen($title)<3 || mb_strlen($title)>160 || !filter_var($sellerEmail,FILTER_VALIDATE_EMAIL) || mb_strlen($terms)<10 || mb_strlen($terms)>10000 || !in_array($currency,['KES','USDT'],true) || !preg_match('/^\d{1,9}(\.\d{1,2})?$/',$amount) || ($currency==='KES' && (float)$amount!==(float)(int)$amount)) {
    http_response_code(422); exit('Please provide a valid title, seller email, amount in KES or USDT and clear delivery terms.');
}
$minor=(int)round((float)$amount*100);
if ($minor<1 || $minor>100000000000) { http_response_code(422); exit('Amount is outside the allowed range.'); }
$feeMinor=escrow_fee_minor($currency,$minor);
$publicId=bin2hex(random_bytes(13));
$pdo=db();
$pdo->beginTransaction();
$stmt=$pdo->prepare("INSERT INTO deals(public_id,buyer_id,seller_email,title,terms,currency,amount_minor,fee_minor,status) VALUES(?,?,?,?,?,?,?,?, 'awaiting_seller')");
$stmt->execute([$publicId,$user['id'],$sellerEmail,$title,$terms,$currency,$minor,$feeMinor]);
$dealId=(int)$pdo->lastInsertId();
$invite=bin2hex(random_bytes(32));
$inviteStmt=$pdo->prepare("INSERT INTO deal_invites(deal_id,invited_email,token_hash,expires_at) VALUES(?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 DAY))");
$inviteStmt->execute([$dealId,$sellerEmail,hash('sha256',$invite)]);
$inviteId=(int)$pdo->lastInsertId();
$pdo->commit();
$inviteUrl=rtrim($config['app_url'],'/').'/accept-invite.php?token='.rawurlencode($invite);
$headers="From: XWADDA.KE <".$config['mail_from'].">\r\nContent-Type: text/plain; charset=UTF-8";
$sent=mail($sellerEmail,'Review a XWADDA.KE deal invitation',"You have been invited to review a deal on XWADDA.KE.\n\n".$title."\nAgreed seller amount: ".$currency.' '.number_format($minor/100,2)."\nThe platform fee is paid separately by the buyer and does not reduce your agreed amount.\n\nReview the terms:\n".$inviteUrl."\n\nThis link expires in 7 days.",$headers);
if (!$sent) {
    $pdo->prepare("UPDATE deals SET status='draft' WHERE id=?")->execute([$dealId]);
    $pdo->prepare('DELETE FROM deal_invites WHERE id=?')->execute([$inviteId]);
    header('Location: my-deals.php?invite=failed'); exit;
}
header('Location: my-deals.php?created=1'); exit;
