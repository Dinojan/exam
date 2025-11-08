<?php
class AuthController
{
    public function login()
    {
        // echo "login";
        return view("auth.login");
    }

    public function validate_credentials()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $email = $_POST['email'] ?? null;
            $password = $_POST['password'] ?? null;

            if (!$email || !$password) {
                throw new Exception("Email and password are required.");
            }

            if ($email == 'nitadmin@gmail.com' && $password == '@nit') {
                // Start session
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }

                // Save session values
                $_SESSION['email'] = $email;
                $_SESSION['user'] = 1;
                $_SESSION['role'] = 0;
                $_SESSION['username'] = 'NIT';
                $_SESSION['permissions'] = ['read_data'];

                // Return JSON
                return json_encode([
                    'status' => 'success',
                    'msg' => 'Login successful',
                    'user' => [
                        'id' => 1,
                        'role' => 0,
                        'username' => 'NIT',
                        'email' => $email
                    ]
                ]);
            } else if ($email != 'nitadmin@gmail.com') {
                throw new Exception("Invalid email.");
            } else if ($password != '@nit') {
                throw new Exception("Invalid password.");
            } else {
                throw new Exception("Invalid email and password.");
            }
        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function logout()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Destroy all session data
        session_unset();
        session_destroy();

        // Return JSON response
        header('Content-Type: application/json; charset=utf-8');
        return json_encode([
            'status' => 'success',
            'msg' => 'Logged out successfully'
        ]);
    }
}