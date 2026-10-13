<?php
declare(strict_types=1);
require __DIR__ . '/app-loader.php';
header('Content-Type: application/json; charset=UTF-8');
$user=require_login();
$id=filter_input(INPUT_GET,'id',FILTER_VALIDATE_INT);
$stmt=db()->prepare("SELECT p.status FROM payment_intents p JOIN deals d ON d.id=p.deal_id WHERE p.id=? AND d.buyer_id=? LIMIT 1");
$stmt->execute([$id,$user['id']]);$row=$stmt->fetch();
if (!$row) { http_response_code(404); echo json_encode(['error'=>'Not found']); exit; }
echo json_encode(['status'=>$row['status']],JSON_THROW_ON_ERROR);
