<?php

if (!extension_loaded('xdebug')) {
    return;
}

/** @psalm-suppress InvalidGlobal */
$GLOBALS['__cypress_coverage_dir'] = __DIR__ . '/../tests/reports/phpunit/coverage-parts';
if (!is_dir($GLOBALS['__cypress_coverage_dir'])) {
    mkdir($GLOBALS['__cypress_coverage_dir'], 0777, true);
}

xdebug_start_code_coverage(XDEBUG_CC_UNUSED | XDEBUG_CC_DEAD_CODE);

register_shutdown_function(function () {
    $coverage = xdebug_get_code_coverage();
    xdebug_stop_code_coverage();

    if (empty($coverage)) {
        return;
    }

    $filename = $GLOBALS['__cypress_coverage_dir'] . '/coverage-' . microtime(
        true
    ) . '-' . getmypid() . '.json';
    file_put_contents($filename, json_encode($coverage));
});
