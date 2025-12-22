<?php

class ResultsAPI
{
    private $db;
    public function __construct()
    {
        $this->db = db();
    }
    public function getStudentResults($student_id)
    {
        try {
            $where_cluse = "";
            $params = [];
            if ($student_id != 'all') {
                $where_cluse = " AND ea.student_id = ?";
                $params = [$student_id];
            }
            $stmt = $this->db->prepare("SELECT ea.*, er.attempts_count as attempts FROM exam_attempts ea LEFT JOIN exam_registration er ON ea.registration_id = er.id WHERE ea.status IN ('completed','rules_violation') $where_cluse");
            $stmt->execute($params);
            $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];

            foreach ($attempts as $attempt) {
                $stmt = $this->db->prepare("SELECT ei.*, es.retake as allow_retake, es.max_attempts FROM exam_info ei LEFT JOIN exam_settings es ON es.exam_id = ei.id WHERE ei.id = ?");
                $stmt->execute([$attempt['exam_id']]);
                $exam = $stmt->fetch(PDO::FETCH_ASSOC);

                // 3. Get questions
                $stmt = $this->db->prepare("SELECT * FROM questions WHERE JSON_CONTAINS(exam_ids, JSON_QUOTE(?))");
                $stmt->execute([$exam['id']]);
                $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $correct = 0;
                $wrong = 0;
                $skipped = 0;

                $answers = json_decode($attempt['answers'], true);

                foreach ($questions as $q) {
                    $found = false;

                    foreach ($answers as $a) {
                        if ($a['question_id'] == $q['id']) {
                            $found = true;

                            if ($a['answer'] == $q['answer']) {
                                $correct++;
                            } else {
                                $wrong++;
                            }
                            break;
                        }
                    }

                    if (!$found) {
                        $skipped++;
                    }
                }


                list($h, $m, $s) = explode(':', $attempt['time_remaining']);
                $timeRemainingSeconds = ($h * 3600) + ($m * 60) + $s;
                $totalDurationSeconds = $exam['duration'] * 60;
                $timeTakenSeconds = $totalDurationSeconds - $timeRemainingSeconds;

                $results[] = [
                    'id' => (int) $attempt['id'],
                    'exam_id' => (int) $exam['id'],
                    'exam_title' => $exam['title'],
                    'exam_code' => str_replace(' ', '_', $exam['code']),
                    'score' => (int) $attempt['score'],
                    'total_marks' => (int) $exam['total_marks'],
                    'percentage' => ($attempt['score'] / $exam['total_marks']) * 100,
                    'passing_percentage' => ($exam['passing_marks'] / $exam['total_marks']) * 100,
                    'time_taken' => $timeTakenSeconds,
                    'time_taken_percentage' => round(($timeTakenSeconds / $totalDurationSeconds) * 100, 2),
                    'correct_answers' => $correct,
                    'incorrect_answers' => $wrong,
                    'skipped_questions' => $skipped,
                    'total_questions' => $exam['total_num_of_ques'],
                    'completed_date' => str_replace(' ', 'T', $attempt['completed_at']),
                    'allow_retake' => ($exam['allow_retake'] && $attempt['attempts'] < $exam['max_attempts']) ? true : false,
                    'is_passed' => $attempt['score'] >= $exam['passing_marks'],
                ];
            }

            return json_encode([
                "results" => $results,
                'status' => 'success',
            ]);
        } catch (Exception $e) {
            return json_encode([
                "error" => $e->getMessage(),
                'status' => 'error',
            ]);
        }
    }

    public function getStudentResultsWithQuestions($attempt_id, $exam_id, $student_id = null)
    {
        try {
            $user_id = $student_id ? $student_id : user_id();
            if (getUserGroupName($user_id) != 'Student') {
                throw new Exception('Unauthorized Access');
            }

            $stmt = $this->db->prepare("SELECT ea.*, er.attempts_count as attempts FROM exam_attempts ea LEFT JOIN exam_registration er ON ea.registration_id = er.id WHERE ea.id = ? AND ea.student_id = ? AND ea.status IN ('completed','rules_violation')");
            $stmt->execute([$attempt_id, $user_id]);
            $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$attempt) {
                throw new Exception('No results found');
            }

            $results = [];
            $all_questions = [];
            $stmt = $this->db->prepare("SELECT ei.*, es.retake as allow_retake, es.max_attempts FROM exam_info ei LEFT JOIN exam_settings es ON es.exam_id = ei.id WHERE ei.id = ?");
            $stmt->execute([$exam_id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);

            // 3. Get questions
            $stmt = $this->db->prepare("SELECT * FROM questions WHERE JSON_CONTAINS(exam_ids, JSON_QUOTE(?))");
            $stmt->execute([$exam['id']]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $correct = 0;
            $wrong = 0;
            $skipped = 0;

            $answers = json_decode($attempt['answers'], true);

            foreach ($questions as $q) {
                $found = false;

                foreach ($answers as $a) {
                    if ($a['question_id'] == $q['id']) {
                        $found = true;

                        if ($a['answer'] == $q['answer']) {
                            $correct++;
                            $q['status'] = 'correct';
                        } else {
                            $wrong++;
                            $q['status'] = 'incorrect';
                        }
                        break;
                    }
                }

                if (!$found) {
                    $skipped++;
                    $q['status'] = 'skipped';
                }

                $all_questions[] = $q;
            }

            $options_keys = ['A', 'B', 'C', 'D'];

            foreach ($all_questions as &$question) {
                $options = [];

                foreach ($options_keys as $key) {
                    $isSelected = false;
                    $isCorrect = ($question['answer'] === $key);

                    foreach ($answers as $answer) {
                        if ($answer['question_id'] == $question['id']) {
                            if ($answer['answer'] === $key) {
                                $isSelected = true;
                            }
                            break;
                        }
                    }

                    $options[] = [
                        'text' => $question[strtolower($key)],
                        'is_selected' => $isSelected,
                        'is_correct' => $isCorrect,
                        'op' => $key,
                    ];
                }

                $question['options'] = $options;
            }


            list($h, $m, $s) = explode(':', $attempt['time_remaining']);
            $timeRemainingSeconds = ($h * 3600) + ($m * 60) + $s;
            $totalDurationSeconds = $exam['duration'] * 60;
            $timeTakenSeconds = $totalDurationSeconds - $timeRemainingSeconds;

            $results = [
                'exam_id' => (int) $exam['id'],
                'exam_title' => $exam['title'],
                'exam_code' => str_replace(' ', '_', $exam['code']),
                'score' => (int) $attempt['score'],
                'total_marks' => (int) $exam['total_marks'],
                'percentage' => ($attempt['score'] / $exam['total_marks']) * 100,
                'passing_percentage' => ($exam['passing_marks'] / $exam['total_marks']) * 100,
                'time_taken' => $timeTakenSeconds,
                'time_taken_percentage' => round(($timeTakenSeconds / $totalDurationSeconds) * 100, 2),
                'correct_answers' => $correct,
                'incorrect_answers' => $wrong,
                'skipped_questions' => $skipped,
                'total_questions' => $exam['total_num_of_ques'],
                'completed_date' => str_replace(' ', 'T', $attempt['completed_at']),
                'allow_retake' => ($exam['allow_retake'] && $attempt['attempts'] < $exam['max_attempts']) ? true : false,
            ];


            $final_questions = [];
            $i = 0;
            foreach ($all_questions as $q) {
                $i++;
                $final_questions[] = [
                    'status' => $q['status'],
                    'options' => $q['options'],
                    'question_text' => $q['question'],
                    'marks' => $q['marks'] + 0,
                    'question_no' => $i,
                    'grid' => $q['grid'] + 0
                ];
            }


            return json_encode([
                "result" => $results,
                'questions' => $final_questions,
                'status' => 'success',
            ]);
        } catch (Exception $e) {
            return json_encode([
                "msg" => $e->getMessage(),
                'status' => 'error',
            ]);
        }
    }

    public function getLecturerResults($student_id)
    {
        return json_encode([
            "results" => [],
            'status' => 'success'
        ]);
    }

    public function getAllResultsForAdmin()
    {
        try {
            $student_id = $_GET['student_id'] ?? 'all';
            $exam_id = $_GET['exam_id'] ?? 'all';
            $filter = $_GET['filter'] ?? 'all';
            $time_filter = $_GET['time_filter'] ?? 'all';

            $where_clause = " WHERE ea.status IN ('completed','rules_violation')";
            $params = [];

            /* Student filter */
            if ($student_id !== 'all') {
                $where_clause .= " AND ea.student_id = ?";
                $params[] = $student_id;
            }

            /* Exam filter */
            if ($exam_id !== 'all') {
                $where_clause .= " AND ea.exam_id = ?";
                $params[] = $exam_id;
            }

            /* Pass / Fail filter */
            if ($filter === 'passed') {
                $where_clause .= " AND ea.score >= ei.passing_marks";
            } elseif ($filter === 'failed') {
                $where_clause .= " AND ea.score < ei.passing_marks";
            }

            /* Time filter */
            if ($time_filter === 'today') {
                $where_clause .= " AND ea.created_at >= CURDATE()";
            } elseif ($time_filter === 'week') {
                $where_clause .= " AND ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            } elseif ($time_filter === 'month') {
                $where_clause .= " AND ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            } elseif ($time_filter === 'quarter') {
                $where_clause .= " AND ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
            }

            $stmt = $this->db->prepare("SELECT ea.*, er.attempts_count as attempts FROM exam_attempts ea LEFT JOIN exam_registration er ON ea.registration_id = er.id  LEFT JOIN exam_info ei ON ei.id = ea.exam_id $where_clause");
            $stmt->execute($params);
            $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];
            $exams = [];

            foreach ($attempts as $attempt) {
                $stmt = $this->db->prepare("SELECT  ei.*, es.retake AS allow_retake, es.max_attempts FROM exam_info ei LEFT JOIN exam_settings es ON es.exam_id = ei.id WHERE ei.id = ? ");
                $stmt->execute([$attempt['exam_id']]);
                $exam = $stmt->fetch(PDO::FETCH_ASSOC);

                // 3. Get questions
                $stmt = $this->db->prepare("SELECT * FROM questions WHERE JSON_CONTAINS(exam_ids, JSON_QUOTE(?))");
                $stmt->execute([$exam['id']]);
                $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $correct = 0;
                $wrong = 0;
                $skipped = 0;

                $answers = json_decode($attempt['answers'], true);

                foreach ($questions as $q) {
                    $found = false;

                    foreach ($answers as $a) {
                        if ($a['question_id'] == $q['id']) {
                            $found = true;

                            if ($a['answer'] == $q['answer']) {
                                $correct++;
                            } else {
                                $wrong++;
                            }
                            break;
                        }
                    }

                    if (!$found) {
                        $skipped++;
                    }
                }


                list($h, $m, $s) = explode(':', $attempt['time_remaining']);
                $timeRemainingSeconds = ($h * 3600) + ($m * 60) + $s;
                $totalDurationSeconds = $exam['duration'] * 60;
                $timeTakenSeconds = $totalDurationSeconds - $timeRemainingSeconds;

                $results[] = [
                    'id' => (int) $attempt['id'],
                    'student_id' => (int) $attempt['student_id'],
                    'student_name' => getUserName($attempt['student_id']),
                    'exam_id' => (int) $exam['id'],
                    'exam_title' => $exam['title'],
                    'exam_code' => str_replace(' ', '_', $exam['code']),
                    'score' => (int) $attempt['score'],
                    'total_marks' => (int) $exam['total_marks'],
                    'percentage' => $exam['total_marks'] > 0 ? ($attempt['score'] / $exam['total_marks']) * 100 : 0,
                    'passing_percentage' => ($exam['passing_marks'] / $exam['total_marks']) * 100,
                    'time_taken' => $timeTakenSeconds,
                    'time_taken_percentage' => round(($timeTakenSeconds / $totalDurationSeconds) * 100, 2),
                    'correct_answers' => $correct,
                    'incorrect_answers' => $wrong,
                    'skipped_questions' => $skipped,
                    'total_questions' => $exam['total_num_of_ques'],
                    'completed_date' => str_replace(' ', 'T', $attempt['completed_at']),
                    'allow_retake' => ($exam['allow_retake'] && $attempt['attempts'] < $exam['max_attempts']) ? true : false,
                    'status' => $attempt['score'] >= $exam['passing_marks'],
                ];

                if (!in_array($exam, $exams)) {
                    $exams[] = $exam;
                }
            }

            return json_encode([
                "results" => $results,
                'status' => 'success',
                'exams' => $exams,
            ]);
        } catch (Exception $e) {
            return json_encode([
                "error" => $e->getMessage(),
                'status' => 'error',
            ]);
        }
    }
}