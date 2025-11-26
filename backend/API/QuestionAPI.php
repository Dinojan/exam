<?php

class QuestionAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }
    function validateRequiredFields($post)
    {
        if (empty($post['question'])) {
            throw new Exception('Question is required');
        }
        if (empty($post['answer'])) {
            throw new Exception('Answer is required');
        }

        // $options = ['A', 'B', 'C', 'D'];
        // foreach ($options as $opt) {
        //     $hasText = !empty($post[$opt]);
        //     $hasFile = isset($_FILES[$opt]) && $_FILES[$opt]['error'] != 4;

        //     if (!$hasText && !$hasFile) {
        //         throw new Exception("Option $opt is required (text or image)");
        //     }
        // }|
    }

    public function addQuestion()
    {
        try {
            $this->validateRequiredFields($_POST);

            $questionText = $_POST['question'];
            $answer = $_POST['answer'];
            $marks = $_POST['marks'];
            $examID = $_POST['exam_id'];
            $A = !empty($_POST['A']) ? $_POST['A'] : null;
            $B = !empty($_POST['B']) ? $_POST['B'] : null;
            $C = !empty($_POST['C']) ? $_POST['C'] : null;
            $D = !empty($_POST['D']) ? $_POST['D'] : null;

            $statment = $this->db->prepare("INSERT INTO questions (question, exam_id, answer, marks, a, b, c, d, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $statment->execute([$questionText, $examID, $answer, $marks, $A, $B, $C, $D, user_id()]);
            $questionId = $this->db->lastInsertId();

            // // Question image
            // $questionImagePath = isset($_FILES['questionImage']) ? uploadFile($_FILES['questionImage'], 'uploads/questions/' . $questionId, $questionId) : null;

            // // Options A/B/C/D
            // $optionsData = [];
            // foreach (['A', 'B', 'C', 'D'] as $opt) {
            //     $text = $_POST[$opt] ?? '';
            //     $filePath = isset($_FILES[$opt . 'img']) ? uploadFile($_FILES[$opt . 'img'], 'uploads/questions/' . $questionId, $questionId . '_' . $opt) : null;

            //     if (!$text && !$filePath) {
            //         throw new Exception("Option $opt is required (text or image)");
            //     }

            //     $optionsData[$opt] = ['text' => $text, 'image' => $filePath];
            // }

            // $statment = $this->db->prepare("UPDATE questions SET q_img = ?, a_img = ? , b_img = ?, c_img =? , d_img = ? WHERE id = ?");
            // $statment->execute([$questionImagePath, $optionsData['A']['image'], $optionsData['B']['image'], $optionsData['C']['image'], $optionsData['D']['image'], $questionId]);

            // $question['options'] = $optionsData; 
            // print_r($questionId);

            // If images are uploaded, set paths here (example)
            $a_img = !empty($_POST['a_img']) ? $_POST['a_img'] : null;
            $b_img = !empty($_POST['b_img']) ? $_POST['b_img'] : null;
            $c_img = !empty($_POST['c_img']) ? $_POST['c_img'] : null;
            $d_img = !empty($_POST['d_img']) ? $_POST['d_img'] : null;

            // Option mapping
            $options = [
                ['op' => 'A', 'order' => 1, 'text' => $A, 'image' => $a_img],
                ['op' => 'B', 'order' => 2, 'text' => $B, 'image' => $b_img],
                ['op' => 'C', 'order' => 3, 'text' => $C, 'image' => $c_img],
                ['op' => 'D', 'order' => 4, 'text' => $D, 'image' => $d_img]
            ];

            $question = [
                'id' => $questionId,
                'question' => $questionText,
                'answer' => $answer,
                'marks' => $marks + 0,
                'examID' => $examID,
                'isSaved' => true,
                'options' => $options,
                'created_at' => date('Y-m-d H:i:s'),
            ];


            return json_encode([
                'status' => 'success',
                'msg' => 'Question added successfully',
                'question' => $question
            ]);

        } catch (Exception $e) {
            return json_encode([
                'msg' => $e->getMessage(),
                'status' => 'error'
            ]);
        }
    }

    public function editQuestion($id)
    {
        try {
            // Incoming values
            $questionId = $id;
            $questionText = $_POST['question'];
            $A = !empty($_POST['A']) ? $_POST['A'] : null;
            $B = !empty($_POST['B']) ? $_POST['B'] : null;
            $C = !empty($_POST['C']) ? $_POST['C'] : null;
            $D = !empty($_POST['D']) ? $_POST['D'] : null;
            $answer = $_POST['answer'];
            $marks = $_POST['marks'];
            $examID = $_POST['exam_id'];

            // If images are uploaded, set paths here (example)
            $a_img = !empty($_POST['a_img']) ? $_POST['a_img'] : null;
            $b_img = !empty($_POST['b_img']) ? $_POST['b_img'] : null;
            $c_img = !empty($_POST['c_img']) ? $_POST['c_img'] : null;
            $d_img = !empty($_POST['d_img']) ? $_POST['d_img'] : null;

            // Update query
            $statement = $this->db->prepare("UPDATE questions SET question = ?, a = ?, b = ?, c = ?, d = ?, answer = ?, marks = ?, exam_id = ?WHERE id = ?");
            $statement->execute([$questionText, $A, $B, $C, $D, $answer, $marks, $examID, $questionId]);

            $statement = $this->db->prepare("SELECT created_at FROM questions WHERE id = ?");
            $statement->execute([$questionId]);
            $question_created_at = $statement->fetch(PDO::FETCH_ASSOC)['created_at'];

            $options = [
                ['op' => 'A', 'order' => 1, 'text' => $A, 'image' => $a_img],
                ['op' => 'B', 'order' => 2, 'text' => $B, 'image' => $b_img],
                ['op' => 'C', 'order' => 3, 'text' => $C, 'image' => $c_img],
                ['op' => 'D', 'order' => 4, 'text' => $D, 'image' => $d_img]
            ];

            $question = [
                'id' => $questionId,
                'question' => $questionText,
                'answer' => $answer,
                'marks' => $marks + 0,
                'examID' => $examID,
                'isSaved' => true,
                'options' => $options,
                'created_at' => $question_created_at
            ];


            return json_encode([
                'status' => 'success',
                'msg' => 'Question edited successfully',
                'question' => $question
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function deleteQuestion($questionId)
    {
        try {
            $statement = $this->db->prepare("DELETE FROM questions WHERE id = ?");
            $statement->execute([$questionId]);

            return json_encode([
                'status' => 'success',
                'msg' => 'Question deleted successfully'
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function assignQuestionToSection($questionId)
    {
        try {
            $new_section_id = $_POST['new_section_id'];

            // Fetch existing section_ids
            $statement = $this->db->prepare("SELECT section_ids FROM questions WHERE id = ?");
            $statement->execute([$questionId]);
            $sectionIds = $statement->fetch(PDO::FETCH_ASSOC)['section_ids'];

            if ($sectionIds) {
                $the_section_ids_array = json_decode($sectionIds, true);

                // Check if already assigned
                if (in_array($new_section_id, $the_section_ids_array)) {
                    throw new Exception("This question is already assigned to this section.");
                }

                // Add new section_id
                $the_section_ids_array[] = $new_section_id;
            } else {
                $the_section_ids_array = [$new_section_id];
            }

            // Update in DB
            $update = $this->db->prepare("UPDATE questions SET section_ids = ? WHERE id = ?");
            $update->execute([json_encode($the_section_ids_array), $questionId]);

            return json_encode([
                'status' => 'success',
                'section_ids' => $the_section_ids_array
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function unassignSection($questionId)
    {
        try {

            if (!isset($_POST['remove_section_id'])) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Section ID is required'
                ]);
            }

            $removeSectionId = intval($_POST['remove_section_id']);

            // Get current question section_ids
            $stmt = $this->db->prepare("SELECT section_ids FROM questions WHERE id = ?");
            $stmt->execute([$questionId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Question not found'
                ]);
            }

            // Decode stored JSON
            $sectionIds = json_decode($row['section_ids'], true);

            if (!is_array($sectionIds)) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Question has no assigned sections'
                ]);
            }

            // Check if section exists in the list
            if (!in_array($removeSectionId, $sectionIds)) {
                return json_encode([
                    'status' => 'error',
                    'msg' => 'Question is not assigned to this section'
                ]);
            }

            // Remove section id from array
            $updatedSections = array_values(array_filter($sectionIds, function ($id) use ($removeSectionId) {
                return intval($id) !== $removeSectionId;
            }));

            // Convert back to JSON or null
            $newJsonValue = empty($updatedSections) ? null : json_encode($updatedSections);

            // Update DB
            $updateStmt = $this->db->prepare("UPDATE questions SET section_ids = ? WHERE id = ?");
            $updateStmt->execute([$newJsonValue, $questionId]);

            return json_encode([
                'status' => 'success',
                'msg' => 'Question successfully removed from section'
            ]);

        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }
}