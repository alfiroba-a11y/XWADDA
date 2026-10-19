<?php
declare(strict_types=1);
require __DIR__ . '/app-loader.php';
header('Content-Type: application/json; charset=UTF-8');
$user=require_login();
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); exit(json_encode(['error'=>'POST required'])); }
$headerToken=(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'');
if (!hash_equals((string)($_SESSION['csrf']??''),$headerToken)) { http_response_code(419); exit(json_encode(['error'=>'Session expired; refresh the page.'])); }
$payload=json_decode((string)file_get_contents('php://input'),true);
$intentId=is_array($payload)?filter_var($payload['intent']??null,FILTER_VALIDATE_INT):false;
$hash=strtolower(trim((string)(is_array($payload)?($payload['tx_hash']??''):'')));
if (!$intentId || !preg_match('/^[a-f0-9]{64}$/',$hash)) { http_response_code(422); exit(json_encode(['error'=>'Enter a valid 64-character transaction hash.'])); }
$stmt=db()->prepare("UPDATE payment_intents p JOIN deals d ON d.id=p.deal_id SET p.provider_payload=JSON_OBJECT('customer_tx_hash',?,'submitted_at',UTC_TIMESTAMP()) WHERE p.id=? AND p.provider='crypto' AND p.status='pending' AND d.buyer_id=? AND d.status='awaiting_payment'");
$stmt->execute([$hash,$intentId,$user['id']]);
if ($stmt->rowCount()!==1) { http_response_code(409); exit(json_encode(['error'=>'This payment is no longer awaiting a transaction hash.'])); }
echo json_encode(['ok'=>true]);
