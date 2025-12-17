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
        $stmt = $this->db->prepare("SELECT ea.*, er.attempts_count as attempts FROM exam_attempts ea LEFT JOIN exam_registration er ON ea.registration_id = er.id WHERE ea.student_id = ? AND ea.status IN ('completed','rules_violation')");
        $stmt->execute([$student_id]);
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
                'allow_retake' => ($exam['allow_retake'] && $exam['max_attempts'] < $attempt['attempts']) ? true : false,
                'is_passed' => $attempt['score'] >= $exam['passing_marks'],
            ];
        }

        return json_encode([
            "results" => $results,
            'status' => 'success',
        ]);
    }

    public function getLecturerResults($student_id)
    {
        return json_encode([
            "results" => [],
            'status' => 'success'
        ]);
    }
}