<?php
declare(strict_types=1);
$search=__DIR__;
for ($depth=0;$depth<6;$depth++) {
    $bootstrap=$search.'/xwadda-private/app/bootstrap.php';
    if (is_file($bootstrap)) { require $bootstrap; return; }
    $parent=dirname($search);
    if ($parent===$search) break;
    $search=$parent;
}
http_response_code(503);
exit('XWADDA application files are not deployed. Check the InterServer cPanel Git deployment paths.');
