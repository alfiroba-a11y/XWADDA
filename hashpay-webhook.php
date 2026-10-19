<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
header('Content-Type: text/plain; charset=UTF-8');
$secret=(string)($config['hashpay_webhook_secret']??'');
$account=(string)($config['hashpay_account_id']??'');
if ($secret==='' || str_contains($secret,'REPLACE') || $account==='' || str_contains($account,'REPLACE')) { http_response_code(503); exit('Webhook is not configured.'); }
$raw=(string)file_get_contents('php://input');
$signature=(string)($_SERVER['HTTP_X_HASHPAY_SIGNATURE']??'');
$expected='sha256='.hash_hmac('sha256',$raw,$secret);
if ($signature==='' || !hash_equals($expected,$signature)) { http_response_code(401); exit('Invalid signature.'); }
$payload=json_decode($raw,true);
if (!is_array($payload)) { http_response_code(400); exit('Invalid JSON.'); }
if ((string)($payload['AccountID']??'')!==$account) { http_response_code(403); exit('Unexpected account.'); }
$reference=(string)($payload['TransactionReference']??'');
$transactionId=(string)($payload['TransactionID']??'');
$event=(string)($payload['event']??'');
$responseCode=(string)($payload['ResponseCode']??'');
if ($reference==='' || $transactionId==='' || !in_array($event,['payment.success','payment.failed'],true)) { http_response_code(400); exit('Missing payment fields.'); }
$pdo=db();
$pdo->beginTransaction();
$stmt=$pdo->prepare("SELECT p.id,p.deal_id,p.amount_minor,p.status,d.status AS deal_status FROM payment_intents p JOIN deals d ON d.id=p.deal_id WHERE p.provider='hashpay' AND p.provider_reference=? FOR UPDATE");
$stmt->execute([$reference]);$payment=$stmt->fetch();
if (!$payment) { $pdo->rollBack(); http_response_code(404); exit('Unknown payment reference.'); }
if ($payment['status']!=='pending') { $pdo->commit(); http_response_code(200); exit('Already processed.'); }
$amount=$payload['TransactionAmount']??null;
$receivedMinor=is_numeric($amount)?(int)round((float)$amount*100):-1;
$providerSuccess=($event==='payment.success' && $responseCode==='0');
$amountMatches=($receivedMinor===(int)$payment['amount_minor']);
$success=($providerSuccess && $amountMatches && $payment['deal_status']==='awaiting_payment');
$safePayload=json_encode(['event'=>$event,'ResponseCode'=>$responseCode,'TransactionID'=>$transactionId,'TransactionAmount'=>$amount,'TransactionDate'=>$payload['TransactionDate']??null,'TransactionReference'=>$reference],JSON_THROW_ON_ERROR);
if ($success) {
    $pdo->prepare("UPDATE payment_intents SET status='confirmed',provider_transaction_id=?,provider_payload=? WHERE id=? AND status='pending'")->execute([$transactionId,$safePayload,$payment['id']]);
    $pdo->prepare("UPDATE deals SET status='funded' WHERE id=? AND status='awaiting_payment'")->execute([$payment['deal_id']]);
} else {
    $newStatus=$providerSuccess?'exception':'failed';
    $pdo->prepare("UPDATE payment_intents SET status=?,provider_transaction_id=?,provider_payload=? WHERE id=? AND status='pending'")->execute([$newStatus,$transactionId,$safePayload,$payment['id']]);
}
$pdo->commit();
http_response_code(200); echo 'OK';
