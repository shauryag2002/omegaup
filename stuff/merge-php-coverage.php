<?php

require_once __DIR__ . '/../vendor/autoload.php';

use SebastianBergmann\CodeCoverage\CodeCoverage;
use SebastianBergmann\CodeCoverage\Report\Clover;
use SebastianBergmann\CodeCoverage\Filter;
use SebastianBergmann\CodeCoverage\RawCodeCoverageData;

$coverageDir = __DIR__ . '/frontend/tests/reports/phpunit/coverage-parts';
if (!is_dir($coverageDir)) {
    echo "No coverage parts found at $coverageDir\n";
    exit(0);
}

$filter = new Filter;
$filter->includeDirectory(__DIR__ . '/frontend/server/src');

$coverage = new CodeCoverage(
    (new SebastianBergmann\CodeCoverage\Driver\Selector)->forLineCoverage($filter),
    $filter
);

$files = glob("$coverageDir/*.json");
echo "Found " . count($files) . " coverage parts.\n";

foreach ($files as $file) {
    echo "Processing $file...\n";
    $data = json_decode(file_get_contents($file), true);
    if ($data) {
        $coverage->append(RawCodeCoverageData::fromXdebugWithoutPathCoverage($data), $file);
    }
}

echo "Generating clover.xml...\n";
(new Clover)->process($coverage, __DIR__ . '/../php-cypress-coverage.xml');
echo "Done!\n";
