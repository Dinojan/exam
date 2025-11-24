<?php

class UserAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }

    // In UserAPI.php or route handler
    public function getAllUsersHandler()
    {
        $filter = isset($_GET['filter']) && $_GET['filter'] !== '' ? $_GET['filter'] : null;
        $status = isset($_GET['status']) && $_GET['status'] !== '' ? $_GET['status'] : null;

        $users = $this->getAllUsers($filter, $status);
        echo $users;
    }


    public function getAllUsers($filter = null, $status = null)
    {
        $conditions = [];
        $params = [];

        // Logged user
        $user = user_id();

        // Role-based filtering
        if ($user == 1) {
            $conditions[] = "users.user_group != 1";
        } elseif ($user == 2) {
            $conditions[] = "users.user_group NOT IN (1,2)";
        } else {
            $conditions[] = "users.user_group NOT IN (1,2,3)";
        }

        // External filter (user_group)
        if ($filter) {

            // Role-based filter access control
            if ($user == 2 && $filter == 2) {
                throw new Exception("Access denied.");
            }

            if ($user == 3 && in_array($filter, [2, 3])) {
                throw new Exception("Access denied.");
            }

            $conditions[] = "users.user_group = ?";
            $params[] = $filter;
        }

        // 🔥 Status filter (0=active, 1=inactive, 3=suspended)
        if ($status !== null && $status !== '') {
            $conditions[] = "users.status = ?";
            $params[] = $status;
        }

        // Build query
        $sql = "SELECT users.*, user_group.name AS group_name FROM users LEFT JOIN user_group ON users.user_group = user_group.id";

        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($result as &$user) {
            $user['status'] = getUserStatusText($user['status']);
        }

        return json_encode($result);
    }



    public function getUserById($id)
    {
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getLoggedUserAccesses()
    {
        $role = getLoggedUserRoleID();
        $permissions = getLoggedUserPermissions();
        return json_encode([
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function createUser() {
        // $data = json_decode(file_get_contents('php://input'), true);

        // // Validate required fields
        // $requiredFields = ['name', 'phone', 'user_group', 'email', 'password'];
        // foreach ($requiredFields as $field) {
        //     if (empty($data[$field])) {
        //         http_response_code(400);
        //         echo json_encode(['error' => "$field is required."]);
        //         return;
        //     }
        // }

        // // Hash the password
        // $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // // Insert user into database
        // $sql = "INSERT INTO users (name, phone, user_group, email, password, status) VALUES (?, ?, ?, ?, ?, ?)";
        // $stmt = $this->db->prepare($sql);
        // $status = isset($data['status']) ? $data['status'] : 1; // Default status to 1 if not provided

        // try {
        //     $stmt->execute([
        //         $data['name'],
        //         $data['phone'],
        //         $data['user_group'],
        //         $data['email'],
        //         $hashedPassword,
        //         $status
        //     ]);

        //     http_response_code(201);
        //     echo json_encode(['message' => 'User created successfully.']);
        // } catch (PDOException $e) {
        //     http_response_code(500);
        //     echo json_encode(['error' => 'Failed to create user: ' . $e->getMessage()]);
        // }

        return json_encode(['message' => 'User created successfully.']);
    }
}