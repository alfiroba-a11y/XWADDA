<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
header('Content-Type: application/json; charset=UTF-8');
$user=require_login();
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); exit(json_encode(['error'=>'POST required'])); }
$headerToken=(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'');
if (!hash_equals((string)($_SESSION['csrf']??''),$headerToken)) { http_response_code(419); exit(json_encode(['error'=>'Session expired; refresh the page.'])); }
$payload=json_decode((string)file_get_contents('php://input'),true);
$publicId=is_array($payload)?(string)($payload['deal']??''):'';
$stmt=db()->prepare("SELECT id,public_id,currency,amount_minor,fee_minor,status FROM deals WHERE public_id=? AND buyer_id=? LIMIT 1");
$stmt->execute([$publicId,$user['id']]);$deal=$stmt->fetch();
if (!$deal || $deal['status']!=='awaiting_payment') { http_response_code(409); exit(json_encode(['error'=>'This deal is not available for payment.'])); }
if ($deal['currency']!=='KES' || ((int)$deal['amount_minor']%100)!==0 || empty($config['hashpay_account_id']) || str_contains($config['hashpay_account_id'],'REPLACE')) { http_response_code(503); exit(json_encode(['error'=>'This payment is not configured.'])); }
$pending=db()->prepare("SELECT id FROM payment_intents WHERE deal_id=? AND provider='hashpay' AND status='confirmed' LIMIT 1");$pending->execute([$deal['id']]);
if ($pending->fetch()) { http_response_code(409); exit(json_encode(['error'=>'This deal already has a confirmed payment.'])); }
$active=db()->prepare("SELECT id FROM payment_intents WHERE deal_id=? AND provider='hashpay' AND status='pending' LIMIT 1");$active->execute([$deal['id']]);
if ($active->fetch()) { http_response_code(409); exit(json_encode(['error'=>'A payment attempt is already pending. Do not pay again; wait for confirmation or contact support.'])); }
$reference='XW'.strtoupper($deal['public_id']).strtoupper(bin2hex(random_bytes(4)));
$totalMinor=(int)$deal['amount_minor']+(int)$deal['fee_minor'];
$stmt=db()->prepare("INSERT INTO payment_intents(deal_id,provider,provider_reference,amount_minor,currency,status) VALUES(?,'hashpay',?,?,?,'pending')");
$stmt->execute([$deal['id'],$reference,$totalMinor,$deal['currency']]);
echo json_encode(['intent'=>(int)db()->lastInsertId(),'account'=>$config['hashpay_account_id'],'amount'=>$totalMinor/100,'reference'=>$reference],JSON_THROW_ON_ERROR);
