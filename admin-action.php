<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
$admin=require_admin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('POST required.'); }
verify_csrf();
$id=filter_input(INPUT_POST,'id',FILTER_VALIDATE_INT);
$action=(string)($_POST['action']??'');
$status=(string)($_POST['status']??'');
$txHash=strtolower(trim((string)($_POST['tx_hash']??'')));
$pdo=db();
if (!$id || $id < 1) { http_response_code(400); exit('Invalid record.'); }
if ($action==='user_status' && in_array($status,['active','suspended','closed'],true) && $id !== $admin['id']) {
    $stmt=$pdo->prepare('UPDATE users SET status=? WHERE id=?'); $stmt->execute([$status,$id]);
    $target='user'; $details=['status'=>$status];
} elseif ($action==='report_status' && in_array($status,['reviewing','substantiated','unsubstantiated','appealed','closed'],true)) {
    $stmt=$pdo->prepare('UPDATE safety_reports SET status=?,reviewer_id=? WHERE id=?'); $stmt->execute([$status,$admin['id'],$id]);
    $target='safety_report'; $details=['status'=>$status];
} elseif ($action==='crypto_confirm' && preg_match('/^[a-f0-9]{64}$/',$txHash)) {
    $pdo->beginTransaction();
    $stmt=$pdo->prepare("SELECT p.id,p.deal_id,p.network,p.status,d.status AS deal_status FROM payment_intents p JOIN deals d ON d.id=p.deal_id WHERE p.id=? AND p.provider='crypto' FOR UPDATE");
    $stmt->execute([$id]);$payment=$stmt->fetch();
    if (!$payment || !in_array($payment['status'],['created','pending'],true) || $payment['deal_status']!=='awaiting_payment') { $pdo->rollBack(); http_response_code(409); exit('Payment is no longer awaiting verification.'); }
    $pdo->prepare("UPDATE payment_intents SET status='confirmed',provider_transaction_id=?,provider_payload=? WHERE id=?")->execute([$txHash,json_encode(['confirmed_by_admin'=>(int)$admin['id'],'transaction_hash'=>$txHash,'network'=>$payment['network']],JSON_THROW_ON_ERROR),$id]);
    $pdo->prepare("UPDATE deals SET status='funded' WHERE id=? AND status='awaiting_payment'")->execute([$payment['deal_id']]);
    $target='payment_intent'; $details=['status'=>'confirmed','network'=>$payment['network'],'transaction_hash'=>$txHash];
} else { http_response_code(400); exit('Unsupported operation.'); }
$stmt=$pdo->prepare('INSERT INTO admin_audit_log(admin_id,action,target_type,target_id,details,ip_hash) VALUES(?,?,?,?,?,?)');
$ip=(string)($_SERVER['REMOTE_ADDR']??'');
$stmt->execute([$admin['id'],$action,$target,(string)$id,json_encode($details),$ip?hash('sha256',$ip):null]);
if ($action==='crypto_confirm') $pdo->commit();
header('Location: admin.php'); exit;
