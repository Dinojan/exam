<?php
// config/app.php
// Use getenv('KEY') for env vars
return [
    'name' => getenv('APP_NAME') ?: 'Online Exam',
    'version' => getenv('APP_VERSION') ?: '1.0.0',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => (bool) (getenv('APP_DEBUG') ?: false),
    'url' => getenv('APP_URL') ?: 'http://localhost',
    'timezone' => 'UTC',
    'locale' => 'en',
    'collapse'=>true,
    'logo'=> 'assets/img/logo.png',
    
];