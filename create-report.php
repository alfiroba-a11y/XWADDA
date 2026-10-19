<?php
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('POST required.'); }
verify_csrf();
$category=trim((string)($_POST['category']??''));
$details=trim((string)($_POST['details']??''));
$allowed=['Payment requested outside the deal','Impersonation or fake profile','Misleading listing','Other safety concern'];
if (!in_array($category,$allowed,true) || mb_strlen($details)<20 || mb_strlen($details)>8000) {
  http_response_code(422); exit('Choose a report category and provide at least 20 characters of relevant detail.');
}
$user=current_user();
$stmt=db()->prepare('INSERT INTO safety_reports(reporter_id,category,details) VALUES(?,?,?)');
$stmt->execute([$user['id']??null,$category,$details]);
header('Location: index.php?report=submitted'); exit;
