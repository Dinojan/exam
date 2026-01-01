<?php

class ModalAPI
{
    public function getModal($file_name)
    {
        $path = getModalFile($file_name);

        if ($path && file_exists($path)) {
            header('Content-Type: text/html; charset=utf-8');
            header('Access-Control-Allow-Origin: *');

            include $path;
            exit;
        } else {
            http_response_code(404);
            echo '<h1 style="color:red; text-align:center;">404 - Modal Not Found</h1>';
            echo '<p>File: ' . htmlspecialchars($file_name) . '</p>';
            exit;
        }
    }
}