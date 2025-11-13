<?php

class UserGroupAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }

    public function getAllGroups()
    {
        $sql = "SELECT * FROM user_group";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($result);
    }

    public function getGroup($id)
    {
        $sql = "SELECT * FROM user_group WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getGroupPermissions($id)
    {
        $sql = "SELECT permission FROM user_group WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Convert string "['exams.create']" to proper array
        $permissions = [];
        if (!empty($row['permission'])) {
            $permissions = json_decode(str_replace("'", '"', $row['permission']), true);
        }

        return json_encode(['permissions' => $permissions]);
    }

}