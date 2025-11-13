<?php

class ModalAPI
{
    public function getModal($file_name)
    {
        $path = getModalFile($file_name); // உங்கள் function

        // HTML file இருந்தால் மட்டும்
        if ($path && file_exists($path)) {
            // Header: HTML என்று சொல்லவும்
            header('Content-Type: text/html; charset=utf-8');
            header('Access-Control-Allow-Origin: *');

            // நேரடியாக HTML file ஐ include செய்யவும்
            include $path;
            exit; // முக்கியம் — மேலும் PHP execute ஆகாது
        } else {
            // File இல்லையெனில் 404
            http_response_code(404);
            echo '<h1 style="color:red; text-align:center;">404 - Modal Not Found</h1>';
            echo '<p>File: ' . htmlspecialchars($file_name) . '</p>';
            exit;
        }
    }
}