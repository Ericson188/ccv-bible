<?php
// Simple PHP server for Bible app
// Navigate to: http://localhost/ccv-bible/

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/' || $uri === '/index.html') {
    header('Location: /ccv-bible/index.html');
    exit;
}

// Serve static files
if (preg_match('/\.(?:css|js|xml)$/', $uri)) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        if (strpos($uri, '.css') !== false) {
            header('Content-Type: text/css');
        } elseif (strpos($uri, '.js') !== false) {
            header('Content-Type: application/javascript');
        } elseif (strpos($uri, '.xml') !== false) {
            header('Content-Type: application/xml');
        }
        readfile($file);
        exit;
    }
}

// Fallback to index.html for SPA routing
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
}
?>
