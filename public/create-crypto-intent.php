<?php
declare(strict_types=1);
require __DIR__ . '/app-loader.php';
header('Content-Type: application/json; charset=UTF-8');
$user=require_login();
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); exit(json_encode(['error'=>'POST required'])); }
$headerToken=(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'');
if (!hash_equals((string)($_SESSION['csrf']??''),$headerToken)) { http_response_code(419); exit(json_encode(['error'=>'Session expired; refresh the page.'])); }
$payload=json_decode((string)file_get_contents('php://input'),true);
$publicId=is_array($payload)?(string)($payload['deal']??''):'';
$network=is_array($payload)?(string)($payload['network']??''):'';
if (!in_array($network,['tron','bsc'],true)) { http_response_code(422); exit(json_encode(['error'=>'Choose TRC20 or BEP20.'])); }
$pdo=db();
$pdo->beginTransaction();
$stmt=$pdo->prepare("SELECT id,public_id,currency,amount_minor,fee_minor,status FROM deals WHERE public_id=? AND buyer_id=? FOR UPDATE");
$stmt->execute([$publicId,$user['id']]);$deal=$stmt->fetch();
if (!$deal || $deal['currency']!=='USDT' || $deal['status']!=='awaiting_payment') { $pdo->rollBack(); http_response_code(409); exit(json_encode(['error'=>'This USDT deal is not available for payment.'])); }
$active=$pdo->prepare("SELECT id,provider_reference,network FROM payment_intents WHERE deal_id=? AND provider='crypto' AND status IN ('created','pending') FOR UPDATE");
$active->execute([$deal['id']]);$existing=$active->fetch();
if ($existing) {
    if ($existing['network']!==$network) { $pdo->rollBack(); http_response_code(409); exit(json_encode(['error'=>'There is already a pending attempt on the other network. Contact support before switching networks.'])); }
    $pdo->commit(); echo json_encode(['intent'=>(int)$existing['id'],'reference'=>$existing['provider_reference']]); exit;
}
$reference='XWCR'.strtoupper($deal['public_id']).strtoupper(bin2hex(random_bytes(3)));
$stmt=$pdo->prepare("INSERT INTO payment_intents(deal_id,provider,provider_reference,network,amount_minor,currency,status) VALUES(?,'crypto',?,?,?,'USDT','pending')");
$stmt->execute([$deal['id'],$reference,$network,(int)$deal['amount_minor']+(int)$deal['fee_minor']]);$intentId=(int)$pdo->lastInsertId();
$pdo->commit();
echo json_encode(['intent'=>$intentId,'reference'=>$reference],JSON_THROW_ON_ERROR);
