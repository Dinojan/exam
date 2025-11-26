<?php
use Backend\Modal\Auth;

class ExamAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }

    public function saveExamBasicInfo()
    {
        try {

            // print_r($_POST);
            // Retrieve and validate input data
            $examTitle = $_POST['examTitle'] ?? null;
            $examCode = $_POST['examCode'] ?? null;
            $examDuration = $_POST['examDuration'] ?? null;
            $totalMarks = $_POST['totalMarks'] ?? null;
            $passingMarks = $_POST['passingMarks'] ?? null;
            $instructions = $_POST['instructions'] ?? '';
            $examStatus = $_POST['examStatus'] ?? 1;

            if (!$examTitle || !$examCode || !$examDuration || !$totalMarks || !$passingMarks) {
                throw new Exception("All required fields must be filled.");
            }

            if ($examStatus == 'sheduled') {
                $examStatus = 2;
            } else if ($examStatus == 'published') {
                $examStatus = 1;
            } else if ($examStatus == 'draft') {
                $examStatus = 0;
            } else {
                $examStatus = 0; // default to draft
            }

            // Save exam basic info to the database
            $stmt = $this->db->prepare("INSERT INTO exam_info (title, code, total_marks, duration, passing_marks, instructions, created_by, status) VALUES (? , ? , ? , ? , ? , ? , ? , ?)");
            $stmt->execute([
                $examTitle,
                $examCode,
                $totalMarks,
                $examDuration,
                $passingMarks,
                $instructions,
                user_id(),
                $examStatus
            ]);
            $examId = $this->db->lastInsertId();

            return json_encode([
                'status' => 'success',
                'msg' => 'Exam basic information saved successfully.',
                'exam_id' => $examId
            ]);
        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'msg' => $e->getMessage()
            ]);
        }
    }

    public function getExamData($id)
    {
        $sql = "SELECT id, title, duration, code, total_marks, passing_marks, instructions, status 
            FROM exam_info WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$exam) {
            return json_encode([
                'status' => 'error',
                'msg' => 'Exam not found.'
            ]);
        }

        // Fix status
        $exam['status'] = ($exam['status'] == '0') ? 'Draft' : 'Published';
        $exam['duration'] = $exam['duration'] + 0;

        // Fetch questions
        $questions = [];
        $statment = $this->db->prepare("SELECT * FROM questions WHERE exam_id = ?");
        $statment->execute([$id]);

        if ($statment->rowCount() > 0) {
            $examQuestions = $statment->fetchAll(PDO::FETCH_ASSOC);

            foreach ($examQuestions as $question) {

                // Option mapping
                $optionMap = [
                    'a' => ['order' => 1, 'op' => 'A'],
                    'b' => ['order' => 2, 'op' => 'B'],
                    'c' => ['order' => 3, 'op' => 'C'],
                    'd' => ['order' => 4, 'op' => 'D']
                ];

                $options = [];

                foreach ($optionMap as $key => $meta) {

                    $text = $question[$key] ?? '';
                    $img = $question[$key . '_img'] ?? '';

                    $options[] = [
                        'text' => $text,
                        'image' => $img,
                        'order' => $meta['order'],
                        'op' => $meta['op']
                    ];
                }

                // Attach options
                $question['options'] = $options;
                $question['isSaved'] = true;
                $question['marks'] = $question['marks'] + 0;
                if (!empty($question['section_ids'])) {
                    $assignedSections = json_decode($question['section_ids'], true);
                    // Convert all IDs to integers
                    $question['assignedSections'] = array_map('intval', $assignedSections);
                }


                $questions[] = $question;
            }
        }

        $statment = $this->db->prepare("SELECT * FROM sections WHERE exam_id = ?");
        $statment->execute([$id]);

        if ($statment->rowCount() > 0) {
            $scts = $statment->fetchAll(PDO::FETCH_ASSOC);
            foreach ($scts as $sct) {
                $stmt = $this->db->prepare("SELECT * FROM questions");
                $stmt->execute();
                $allQuestions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $sectionQuestions = [];
                foreach ($allQuestions as $q) {
                    if ($q['section_ids'] != null) {
                        $section_ids = json_decode($q['section_ids'], true);
                        if (in_array($sct['id'], $section_ids)) {
                            $sectionQuestions[] = $q;
                        }
                    }
                }

                $question_count = count($sectionQuestions);
                $section = [
                    'id' => $sct['id'],
                    'title' => $sct['title'],
                    'description' => $sct['s_des'],
                    'secondDescription' => $sct['s_s_des'],
                    'question_count' => $sct['num_of_ques'],
                    'examID' => $sct['exam_id'],
                    'assignedQuestions' => $question_count,
                ];

                $sections[] = $section;
            }
        }

        return json_encode([
            'status' => 'success',
            'exam' => $exam,
            'questions' => $questions,
            'sections' => $sections,
        ]);
    }
}