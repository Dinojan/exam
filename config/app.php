<?php
// config/app.php
// Use getenv('KEY') for env vars
$y =  date('Y');
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
    'powered-url' => 'https://northernithub.com/',
    'powered-text' => 'Powered by: NorthernHub',
    'copyright' => 'Copyright '. $y .' NorthernHub. All rights reserved.',
];