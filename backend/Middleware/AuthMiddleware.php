<?php
class AuthMiddleware {
    public function handle($router) {
        session_start();

        // Current URL get
        $currentUrl = $_SERVER['REQUEST_URI']; 
        $encodedUrl = urlencode($currentUrl);

        if (!isset($_SESSION['user'])) {
            $router->redirect("login?redirect={$encodedUrl}");
            exit;
        }
    }
}
