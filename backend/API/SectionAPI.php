<?php
class SectionAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }

    public function addSection()
    {
        try {
            if (empty($_POST['exam_id'])) {
                throw new Exception("Please select an exam");
            }

            if (empty($_POST['section_title'])) {
                throw new Exception("Section title is required");
            }

            if (empty($_POST['section_question_count'])) {
                throw new Exception("Section question count is required");
            }

            $examID = $_POST['exam_id'];
            $title = $_POST['section_title'];
            $num_of_questions = $_POST['section_question_count'];
            $description = !empty($_POST['section_description']) ? $_POST['section_description'] : null;
            $second_description = !empty($_POST['section_second_description']) ? $_POST['section_second_description'] : null;

            $statement = $this->db->prepare("INSERT INTO `sections`(`exam_id`, `title`, `num_of_ques`, `s_des`, `s_s_des`, `created_by`) VALUES (?, ?, ?, ?, ?, ?)");
            $statement->execute([$examID, $title, $num_of_questions, $description, $second_description, user_id()]);
            $sectionID = $this->db->lastInsertId();

            $sectionData = [
                'id' => $sectionID,
                'examID' => $examID,
                'title' => $title,
                'question_count' => $num_of_questions,
                'description' => $description,
                'secondDescription' => $second_description,
                'assignedQuestions' => 0
            ];

            return json_encode(['status' => 'success', 'msg' => 'Section added successfully', 'section' => $sectionData]);
        } catch (Exception $e) {
            return json_encode(['status' => 'error', 'msg' => $e->getMessage() || 'Something went wrong']);
        }
    }

    public function updateSection($sectionID)
    {
        try {
            $sectionID = intval($sectionID);

            // Get POST data
            $title = $_POST['section_title'] ?? null;
            $description = $_POST['section_description'] ?? '';
            $secondDescription = $_POST['section_second_description'] ?? '';
            $questionCount = isset($_POST['section_question_count']) ? intval($_POST['section_question_count']) : null;

            if (!$title || $questionCount === null) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Title and question count are required'
                ]);
            }

            // Check if section exists
            $stmt = $this->db->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$sectionID]);
            $sct = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$sct) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Section not found'
                ]);
            }

            // Update section fields
            $updateStmt = $this->db->prepare("UPDATE sections SET title = ?, s_des = ?, s_s_des = ?, num_of_ques = ? WHERE id = ?");
            $updateStmt->execute([$title, $description, $secondDescription, $questionCount, $sectionID]);

            // Calculate assignedQuestions dynamically
            $qStmt = $this->db->prepare("SELECT section_ids FROM questions WHERE section_ids IS NOT NULL");
            $qStmt->execute();
            $assignedCount = 0;
            while ($question = $qStmt->fetch(PDO::FETCH_ASSOC)) {
                $sectionIds = json_decode($question['section_ids'], true);
                if (is_array($sectionIds) && in_array($sectionID, $sectionIds)) {
                    $assignedCount++;
                }
            }

            // Prepare section object
            $section = [
                'id' => $sectionID,
                'title' => $title,
                'description' => $description,
                'secondDescription' => $secondDescription,
                'question_count' => $questionCount,
                'examID' => $sct['exam_id'],
                'assignedQuestions' => $assignedCount
            ];

            return json_encode([
                'status' => 'success',
                'msg' => 'Section updated successfully',
                'section' => $section
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function deleteSection($sectionID)
    {
        try {
            $sectionID = intval($sectionID);

            // Check if section exists
            $stmt = $this->db->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$sectionID]);
            $section = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$section) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Section not found'
                ]);
            }

            // Remove sectionID from all questions assigned to this section
            $stmt = $this->db->prepare("SELECT id, section_ids FROM questions WHERE section_ids IS NOT NULL");
            $stmt->execute();
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($questions as $question) {
                $sectionIds = json_decode($question['section_ids'], true);

                if (!is_array($sectionIds))
                    continue;

                // Remove the sectionID
                if (in_array($sectionID, $sectionIds)) {
                    $updatedSectionIds = array_values(array_filter($sectionIds, function ($id) use ($sectionID) {
                        return intval($id) !== $sectionID;
                    }));

                    $newJson = empty($updatedSectionIds) ? null : json_encode($updatedSectionIds);

                    $updateStmt = $this->db->prepare("UPDATE questions SET section_ids = ? WHERE id = ?");
                    $updateStmt->execute([$newJson, $question['id']]);
                }
            }

            // Delete section
            $deleteStmt = $this->db->prepare("DELETE FROM sections WHERE id = ?");
            $deleteStmt->execute([$sectionID]);

            return json_encode([
                'status' => 'success',
                'msg' => 'Section deleted successfully'
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

}