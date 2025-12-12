app.controller('ExamAttemptController', [
    "$scope", "$http", "$compile", "$timeout", "window", "$sce", "$interval",
    function ($scope, $http, $compile, $timeout, window, $sce, $interval) {
        // Initialize scope variables
        $scope.examId = window.getIdFromUrl(1);
        $scope.loading = true;
        $scope.useDummyData = false;
        $scope.error = null;
        $scope.examData = null;
        $scope.questions = [];
        $scope.currentQuestionIndex = 0;
        $scope.currentQuestion = null;
        $scope.timeRemaining = 7200; // 2 hours in seconds
        $scope.timeRemainingFormatted = "02:00:00";
        $scope.timerWarning = false;
        $scope.timeExpired = false;
        $scope.answeredCount = 0;
        $scope.flaggedCount = 0;
        $scope.showReviewModal = false;
        $scope.showSubmitConfirmation = false;
        $scope.showSuccessModal = false;
        $scope.submissionTime = null;
        $scope.timeTaken = 0;
        $scope.timeTakenFormatted = "00:00";
        $scope.examStartedAt = null;
        $scope.examEndTime = null;
        $scope.timerInterval = null;
        $scope.autoSaveInterval = null;
        $scope.isSubmitting = false;
        $scope.attemptId = null;
        $scope.estimatedScore = 0;

        // Comprehensive Dummy Data
        $scope.dummyExamData = {
            id: "demo-101",
            title: "Web Development Fundamentals - Final Exam",
            code: "WD101-FINAL-2024",
            duration: 120, // minutes
            total_questions: 25,
            total_marks: 100,
            passing_marks: 40,
            schedule_type: "scheduled",
            start_time: "2024-12-15T09:00:00Z",
            instructions: $sce.trustAsHtml(`
                <div class="space-y-2">
                    <p><strong>Read all instructions carefully before starting:</strong></p>
                    <ol class="list-decimal pl-5 space-y-1">
                        <li>This exam consists of 25 multiple choice questions.</li>
                        <li>Each question carries 4 marks.</li>
                        <li>There is negative marking of 1 mark for each wrong answer.</li>
                        <li>Total duration of the exam is 120 minutes.</li>
                        <li>Use the question navigator to jump between questions.</li>
                        <li>Flag questions you want to review later.</li>
                        <li>Click "Save Answer" to save your response.</li>
                        <li>Submit only when you have answered all questions.</li>
                    </ol>
                    <p class="mt-3 text-yellow-300"><i class="fas fa-exclamation-triangle mr-1"></i> Do not refresh or close the browser during the exam.</p>
                </div>
            `),
            shuffle_questions: true,
            shuffle_options: false,
            full_screen_mode: true,
            disable_copy_paste: true,
            disable_right_click: true,
            show_results_immediately: true,
            allow_retake: false,
            max_attempts: 1
        };

        // Dummy Questions Data
        $scope.dummyQuestions = [
            {
                id: 1,
                question: $sce.trustAsHtml("What does HTML stand for?"),
                marks: 4,
                difficulty: "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("Hyper Text Markup Language"), correct: true, explanation: "HTML is the standard markup language for creating web pages." },
                    { op: "B", text: $sce.trustAsHtml("High Tech Modern Language"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("Hyper Transfer Markup Language"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("Home Tool Markup Language"), correct: false }
                ],
                answer: null,
                flagged: false
            },
            {
                id: 2,
                question: $sce.trustAsHtml("Which CSS property controls the text size?"),
                marks: 4,
                difficulty: "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("text-size"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("font-size"), correct: true, explanation: "The font-size property sets the size of the text." },
                    { op: "C", text: $sce.trustAsHtml("text-style"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("font-style"), correct: false }
                ],
                answer: null,
                flagged: false
            },
            {
                id: 3,
                question: $sce.trustAsHtml("Which of the following is NOT a JavaScript data type?"),
                marks: 4,
                difficulty: "Medium",
                options: [
                    { op: "A", text: $sce.trustAsHtml("String"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("Number"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("Boolean"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("Character"), correct: true, explanation: "JavaScript has String, Number, Boolean, Object, Null, Undefined, and Symbol data types, but not Character as a separate type." }
                ],
                answer: "A",
                flagged: true
            },
            {
                id: 4,
                question: $sce.trustAsHtml("What will be the output of: console.log(typeof null) in JavaScript?"),
                marks: 4,
                difficulty: "Hard",
                options: [
                    { op: "A", text: $sce.trustAsHtml("null"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("undefined"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("object"), correct: true, explanation: "This is a known quirk in JavaScript - typeof null returns 'object'." },
                    { op: "D", text: $sce.trustAsHtml("string"), correct: false }
                ],
                answer: "C",
                flagged: false
            },
            {
                id: 5,
                question: $sce.trustAsHtml("Which HTTP method is used to send data to a server to create a new resource?"),
                marks: 4,
                difficulty: "Medium",
                options: [
                    { op: "A", text: $sce.trustAsHtml("GET"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("POST"), correct: true, explanation: "POST is used to create new resources on the server." },
                    { op: "C", text: $sce.trustAsHtml("PUT"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("DELETE"), correct: false }
                ],
                answer: "B",
                flagged: false
            },
            {
                id: 6,
                question: $sce.trustAsHtml("What does CSS stand for?"),
                marks: 4,
                difficulty: "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("Creative Style Sheets"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("Cascading Style Sheets"), correct: true, explanation: "CSS stands for Cascading Style Sheets." },
                    { op: "C", text: $sce.trustAsHtml("Computer Style Sheets"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("Colorful Style Sheets"), correct: false }
                ],
                answer: null,
                flagged: false
            },
            {
                id: 7,
                question: $sce.trustAsHtml("Which symbol is used for comments in JavaScript?"),
                marks: 4,
                difficulty: "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("// for single-line, /* */ for multi-line"), correct: true, explanation: "JavaScript uses // for single-line comments and /* */ for multi-line comments." },
                    { op: "B", text: $sce.trustAsHtml("# for single-line, ### for multi-line"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("<!-- --> for both"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("' ' for single-line"), correct: false }
                ],
                answer: null,
                flagged: true
            },
            {
                id: 8,
                question: $sce.trustAsHtml("What is the purpose of the 'this' keyword in JavaScript?"),
                marks: 4,
                difficulty: "Hard",
                options: [
                    { op: "A", text: $sce.trustAsHtml("Refers to the current function"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("Refers to the global object"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("Refers to the object it belongs to"), correct: true, explanation: "The 'this' keyword refers to the object that is executing the current function." },
                    { op: "D", text: $sce.trustAsHtml("Refers to the parent object"), correct: false }
                ],
                answer: null,
                flagged: false
            },
            {
                id: 9,
                question: $sce.trustAsHtml("Which HTML tag is used to create a hyperlink?"),
                marks: 4,
                difficulty: "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("&lt;link&gt;"), correct: false },
                    { op: "B", text: $sce.trustAsHtml("&lt;a&gt;"), correct: true, explanation: "The &lt;a&gt; tag defines a hyperlink." },
                    { op: "C", text: $sce.trustAsHtml("&lt;href&gt;"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("&lt;url&gt;"), correct: false }
                ],
                answer: "B",
                flagged: false
            },
            {
                id: 10,
                question: $sce.trustAsHtml("What does API stand for?"),
                marks: 4,
                difficulty: "Medium",
                options: [
                    { op: "A", text: $sce.trustAsHtml("Application Programming Interface"), correct: true, explanation: "API stands for Application Programming Interface." },
                    { op: "B", text: $sce.trustAsHtml("Advanced Programming Interface"), correct: false },
                    { op: "C", text: $sce.trustAsHtml("Application Process Integration"), correct: false },
                    { op: "D", text: $sce.trustAsHtml("Automated Programming Interface"), correct: false }
                ],
                answer: null,
                flagged: false
            }
        ];

        // Add more dummy questions to reach 25
        for (let i = 11; i <= 25; i++) {
            $scope.dummyQuestions.push({
                id: i,
                question: $sce.trustAsHtml(`Sample question ${i} about web development concepts?`),
                marks: 4,
                difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
                options: [
                    { op: "A", text: $sce.trustAsHtml("Option A for question " + i), correct: i % 4 === 0 },
                    { op: "B", text: $sce.trustAsHtml("Option B for question " + i), correct: i % 4 === 1 },
                    { op: "C", text: $sce.trustAsHtml("Option C for question " + i), correct: i % 4 === 2 },
                    { op: "D", text: $sce.trustAsHtml("Option D for question " + i), correct: i % 4 === 3 }
                ],
                answer: i <= 15 ? (i % 4 === 0 ? "A" : i % 4 === 1 ? "B" : i % 4 === 2 ? "C" : "D") : null,
                flagged: i % 7 === 0
            });
        }

        // Initialize exam
        $scope.init = function () {
            // Try to load real data first
            $scope.loadExamData();
        };

        // Load dummy data
        $scope.loadDummyData = function () {
            $scope.useDummyData = true;
            $scope.loading = true;

            $timeout(() => {
                $scope.examData = angular.copy($scope.dummyExamData);
                $scope.processQuestions(angular.copy($scope.dummyQuestions));
                $scope.initializeTimer(7200); // 2 hours
                $scope.startAutoSave();
                $scope.loading = false;
                $scope.$apply();
            }, 1000);
        };

        // Load exam data
        $scope.loadExamData = async function () {
            try {
                if (!$scope.examId) {
                    // Use dummy data for demo
                    $scope.loadDummyData();
                    return;
                }


                // Load exam details
                const examResponse = await $http.get(
                    window.baseUrl + '/API/exam/attempt/' + $scope.examId
                );

                if (examResponse.data.status === 'success') {
                    const data = examResponse.data.exam_info

                    $scope.examData = {
                        id: data.id,
                        title: data.title.replace(/ /g, "_"),
                        code: data.code.replace(/ /g, "_"),
                        duration: data.duration,
                        total_questions: data.total_questions,
                        total_marks: data.total_marks,
                        passing_marks: data.passing_marks,
                        passing_persentage: (data.passing_marks / data.total_marks) * 100,
                        instructions: $sce.trustAsHtml(data.instructions || ''),
                        schedule_type: data.schedule_type,
                        shuffle_questions: data.shuffle_questions,
                        shuffle_options: data.shuffle_options,
                        full_screen_mode: data.full_screen_mode,
                        disable_copy_paste: data.disable_copy_paste,
                        disable_right_click: data.disable_right_click,
                        allow_retake: data.allow_retake,
                        max_attempts: data.max_attempts > 0 ? data.max_attempts : 1,
                        show_results_immediately: data.show_results_immediately,
                        start_time: new Date(data.start_time).toISOString(),
                        end_time: new Date(new Date(data.start_time).getTime() + data.duration * 1000).toISOString(),
                    };

                    console.log($scope.examData)

                    $scope.timeRemaining = data.duration * 60;

                    // Process questions
                    $scope.processQuestions(examResponse.data.questions, examResponse.data.sections);

                    // Initialize timer
                    $scope.initializeTimer($scope.timeRemaining);

                    // Start auto-save
                    $scope.startAutoSave();

                    $scope.loading = false;
                    $scope.$apply();
                } else {
                    throw new Error(examResponse.data.message || 'Failed to load exam data');
                }
            } catch (error) {
                console.error('Error loading exam:', error);
                // Fall back to dummy data
                $scope.loadDummyData();
            }
        };

        // Process questions
        $scope.processQuestions = function (questionsData, sectionsData) {
            let processedQuestions = questionsData.map((question, index) => {
                // Shuffle options if enabled
                let options = question.options || [];
                if ($scope.examData.shuffle_options) {
                    options = $scope.shuffleArray([...options]);
                }

                return {
                    id: question.id,
                    question: question.question || $sce.trustAsHtml(question.text || ''),
                    // image: question.image,
                    options: options.map(opt => ({
                        op: opt.op,
                        text: opt.text || $sce.trustAsHtml(opt.label || ''),
                        image: opt.image,
                        // explanation: opt.explanation
                    })),
                    marks: question.marks,
                    // difficulty: question.difficulty,
                    answer: question.user_answer || null,
                    flagged: question.flagged || false,
                    order: index + 1
                };
            });


            // Create sections with questions
            $scope.getSectionaizedQuestions(processedQuestions, sectionsData);

            // Shuffle sections if enabled
            if ($scope.examData.shuffle_questions) {
                $scope.reviewSections = $scope.shuffleArray($scope.reviewSections);
            }

            $scope.reviewSections.forEach(section => {
                const questions = section.questions;
                questions.forEach((question) => {
                    question.sectionDescription = section.description;
                    question.sectionSecondDescription = section.second_description;
                    $scope.questions.push(question);
                })
            })

            $scope.currentQuestion = $scope.questions[0];
            $scope.updateCounts();
            $scope.calculateEstimatedScore();
        };

        // Shuffle array
        $scope.shuffleArray = function (array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        // Transform questions into reviewSections structure
        $scope.getSectionaizedQuestions = function (questions, sections = []) {

            // Reset questions in each section
            sections.forEach(section => section.questions = []);

            if (!questions || questions.length === 0) {
                $scope.reviewSections = sections;
                return;
            }

            let reviewSectionsMap = {};
            let reviewSectionsOrder = [];

            questions.forEach(question => {
                let assigned = false;

                // Assign to existing sections if sectionIds exist and match
                if (question.sectionIds && question.sectionIds.length > 0) {
                    for (let counter = 0; counter < question.sectionIds.length; counter++) {
                        let section = sections.find(s => s.id === question.sectionIds[counter]);
                        if (section) {
                            section.questions = section.questions || [];
                            section.questions.push(question);
                            assigned = true;

                            if (!reviewSectionsMap[section.id]) {
                                reviewSectionsMap[section.id] = section;
                                reviewSectionsOrder.push(section);
                            }
                            break;
                        }
                    }
                }

                // If not assigned → create new unique section
                if (!assigned) {
                    let newSectionId = Math.floor(100000 + Math.random() * 900000);
                    let newSection = {
                        id: newSectionId,
                        exam_id: +$scope.examId,
                        description: '',
                        questions: [question],
                        order: sections.length + 1,
                        second_description: ''
                    };

                    sections.push(newSection);

                    reviewSectionsMap[newSection.id] = newSection;
                    reviewSectionsOrder.push(newSection);
                }
            });
            console.log(reviewSectionsOrder);

            $scope.reviewSections = reviewSectionsOrder;

            // Sort questions inside each section by original question order
            $scope.reviewSections.forEach(section => {
                if (section.questions) {
                    section.questions = section.questions.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
                }
            });
        };

        // Initialize timer
        $scope.initializeTimer = function (timeRemainingSeconds) {
            $scope.timeRemaining = timeRemainingSeconds || ($scope.examData?.duration * 60 || 7200);
            $scope.updateTimerDisplay();

            $scope.examEndTime = new Date();
            $scope.examEndTime.setSeconds($scope.examEndTime.getSeconds() + $scope.timeRemaining);

            $scope.timerInterval = $interval(() => {
                $scope.timeRemaining--;
                $scope.updateTimerDisplay();

                // Check for warnings
                if ($scope.timeRemaining <= 300 && !$scope.timerWarning) { // 5 minutes
                    $scope.timerWarning = true;
                    // Play warning sound
                    if (!$scope.useDummyData) {
                        try {
                            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                            audio.volume = 0.3;
                            audio.play();
                        } catch (e) { }
                    }
                }

                // Check if time expired
                if ($scope.timeRemaining <= 0) {
                    $scope.timeExpired = true;
                    $interval.cancel($scope.timerInterval);
                    $scope.forceSubmit();
                }
            }, 1000);
        };

        // Update timer display
        $scope.updateTimerDisplay = function () {
            const hours = Math.floor($scope.timeRemaining / 3600);
            const minutes = Math.floor(($scope.timeRemaining % 3600) / 60);
            const seconds = $scope.timeRemaining % 60;

            $scope.timeRemainingFormatted =
                hours.toString().padStart(2, '0') + ':' +
                minutes.toString().padStart(2, '0') + ':' +
                seconds.toString().padStart(2, '0');
        };

        // Calculate estimated score
        $scope.calculateEstimatedScore = function () {
            let score = 0;
            $scope.questions.forEach(q => {
                if (q.answer) {
                    const selectedOption = q.options.find(opt => opt.op === q.answer);
                    if (selectedOption?.correct) {
                        score += q.marks;
                    } else if ($scope.examData?.negative_marking) {
                        score -= ($scope.examData.negative_mark || 1);
                    }
                }
            });
            $scope.estimatedScore = Math.max(0, score);
        };

        // Start auto-save
        $scope.startAutoSave = function () {
            $scope.autoSaveInterval = $interval(() => {
                $scope.saveProgress();
            }, 30000); // Auto-save every 30 seconds
        };

        // Save progress
        $scope.saveProgress = async function () {
            if ($scope.isSubmitting || $scope.showSuccessModal) return;

            if ($scope.useDummyData) {
                // Simulate save for demo
                console.log('Demo: Progress saved at', new Date().toLocaleTimeString());
                Toast.fire({
                    type: 'info',
                    title: 'Demo Mode',
                    msg: 'Progress auto-saved (Demo Mode)',
                    timer: 1500
                });
                return;
            }

            try {
                const answers = $scope.questions.map(q => ({
                    question_id: q.id,
                    answer: q.answer,
                    flagged: q.flagged
                }));

                await $http.post(
                    window.baseUrl + '/API/exam/save-progress/' + $scope.attemptId,
                    { answers: answers, time_remaining: $scope.timeRemaining }
                );

                console.log('Progress saved at', new Date().toLocaleTimeString());
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        };

        // Update counts
        $scope.updateCounts = function () {
            $scope.answeredCount = $scope.questions.filter(q => q.answer !== null).length;
            $scope.flaggedCount = $scope.questions.filter(q => q.flagged).length;
            $scope.calculateEstimatedScore();
        };

        // Navigation
        $scope.goToQuestion = function (index) {
            if (index >= 0 && index < $scope.questions.length) {
                $scope.currentQuestionIndex = index;
                $scope.currentQuestion = $scope.questions[index];
            }
        };

        $scope.previousQuestion = function () {
            if ($scope.currentQuestionIndex > 0) {
                $scope.goToQuestion($scope.currentQuestionIndex - 1);
            }
        };

        $scope.nextQuestion = function () {
            if ($scope.currentQuestionIndex < $scope.questions.length - 1) {
                $scope.goToQuestion($scope.currentQuestionIndex + 1);
            }
        };

        // Question actions
        $scope.selectAnswer = function (answer) {
            const formData = new FormData();
            formData.append('answer', answer);

            let attempts = 0;
            const maxAttempts = 5;

            function sendAnswer() {
                $http({
                    url: window.baseUrl + '/API/exam/' + $scope.examId + '/attempt/' + $scope.attemptId + '/question/' + $scope.currentQuestion.id + '/answer',
                    method: 'POST',
                    data: formData,
                    headers: { 'Content-Type': undefined }
                }).then(function (response) {
                    const res = response.data;

                    if (res.status === 'success') {
                        $scope.currentQuestion.answer = res.answer;
                    } else {
                        $scope.currentQuestion.answer = null;
                        Toast.fire({
                            type: 'error',
                            title: 'Error!',
                            msg: res.msg || 'Failed to save the answer, please select again.'
                        });
                    }

                    $scope.updateCounts();
                }).catch(function (error) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.warn('Retrying to save answer, attempt', attempts);
                        sendAnswer(); // retry
                    } else {
                        console.error('Error saving answer after 5 attempts:', error);
                        $scope.currentQuestion.answer = null;
                        Toast.fire({
                            type: 'error',
                            title: 'Error!',
                            msg: 'Failed to save the answer, please select the answer again.'
                        });
                        $scope.updateCounts();
                    }
                });
            }

            sendAnswer();
        };


        $scope.clearAnswer = function () {
            $scope.currentQuestion.answer = null;
            $scope.updateCounts();
            Toast.fire({
                type: 'warning',
                title: 'Answer Cleared',
                msg: 'Your answer has been cleared.',
                timer: 1500
            });
        };

        $scope.flagCurrentQuestion = function () {
            $scope.currentQuestion.flagged = !$scope.currentQuestion.flagged;
            $scope.updateCounts();
            Toast.fire({
                type: $scope.currentQuestion.flagged ? 'warning' : 'info',
                title: $scope.currentQuestion.flagged ? 'Question Flagged' : 'Question Unflagged',
                msg: $scope.currentQuestion.flagged ?
                    'Question has been flagged for review' :
                    'Question has been unflagged',
                timer: 1500
            });
        };

        $scope.saveAnswer = function () {
            $scope.saveProgress();
            Toast.fire({
                type: 'success',
                title: 'Answer Saved',
                msg: 'Your answer has been saved successfully.',
                timer: 1500
            });
        };

        $scope.saveAndMark = function () {
            $scope.currentQuestion.flagged = true;
            $scope.saveProgress();
            $scope.nextQuestion();
        };

        $scope.saveAndNext = function () {
            $scope.saveProgress();
            $scope.nextQuestion();
        };

        $scope.saveAllAnswers = function () {
            $scope.saveProgress();
            Toast.fire({
                type: 'success',
                title: 'All Answers Saved',
                msg: 'All your answers have been saved.',
                timer: 1500
            });
        };

        // Review functions
        $scope.reviewExam = function () {
            $scope.showReviewModal = true;
        };

        $scope.closeReviewModal = function () {
            $scope.showReviewModal = false;
        };

        $scope.goToFirstUnanswered = function () {
            const firstUnanswered = $scope.questions.findIndex(q => q.answer === null);
            if (firstUnanswered !== -1) {
                $scope.goToQuestion(firstUnanswered);
                $scope.closeReviewModal();
            } else {
                Toast.fire({
                    type: 'info',
                    title: 'All Questions Answered',
                    msg: 'You have answered all questions!',
                    timer: 2000
                });
            }
        };

        $scope.goToFlaggedQuestions = function () {
            const firstFlagged = $scope.questions.findIndex(q => q.flagged);
            if (firstFlagged !== -1) {
                $scope.goToQuestion(firstFlagged);
                $scope.closeReviewModal();
            } else {
                Toast.fire({
                    type: 'info',
                    title: 'No Flagged Questions',
                    msg: 'You have not flagged any questions.',
                    timer: 2000
                });
            }
        };

        // Submit exam
        $scope.showSubmitModal = function () {
            $scope.showSubmitConfirmation = true;
        };

        $scope.cancelSubmit = function () {
            $scope.showSubmitConfirmation = false;
        };

        $scope.saveAndClose = function () {
            $scope.saveProgress();
            Toast.fire({
                type: 'info',
                title: 'Progress Saved',
                msg: 'Your progress has been saved. You can resume later.',
                timer: 2000
            });
            $timeout(() => {
                window.location.href = window.baseUrl + '/exams';
            }, 2000);
        };

        $scope.submitExam = async function () {
            $scope.isSubmitting = true;
            $scope.showSubmitConfirmation = false;

            try {
                // Calculate time taken
                $scope.timeTaken = ($scope.examData.duration * 60) - $scope.timeRemaining;
                $scope.timeTakenFormatted = $scope.formatTime($scope.timeTaken);
                $scope.submissionTime = new Date();

                if ($scope.useDummyData) {
                    // Demo submission
                    $timeout(() => {
                        // Clear intervals
                        $interval.cancel($scope.timerInterval);
                        $interval.cancel($scope.autoSaveInterval);

                        // Show success modal
                        $scope.showSuccessModal = true;
                        $scope.isSubmitting = false;

                        // Play success sound
                        try {
                            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
                            audio.volume = 0.3;
                            audio.play();
                        } catch (e) { }

                        $scope.$apply();
                    }, 1500);

                    Toast.fire({
                        type: 'info',
                        title: 'Demo Submission',
                        msg: 'Submitting exam in demo mode...',
                        timer: 1500
                    });
                } else {
                    // Prepare final submission
                    const answers = $scope.questions.map(q => ({
                        question_id: q.id,
                        answer: q.answer
                    }));

                    const response = await $http.post(
                        window.baseUrl + '/API/exam/submit/' + $scope.attemptId,
                        {
                            answers: answers,
                            time_taken: $scope.timeTaken
                        }
                    );

                    if (response.data.status === 'success') {
                        // Clear intervals
                        $interval.cancel($scope.timerInterval);
                        $interval.cancel($scope.autoSaveInterval);

                        // Show success modal
                        $scope.showSuccessModal = true;
                    } else {
                        throw new Error(response.data.message || 'Submission failed');
                    }
                }
            } catch (error) {
                console.error('Error submitting exam:', error);
                Toast.fire({
                    type: 'error',
                    title: 'Submission Failed',
                    msg: 'Failed to submit exam. Please try again.'
                });
            } finally {
                $scope.isSubmitting = false;
            }
        };

        $scope.forceSubmit = function () {
            if (!$scope.isSubmitting) {
                $scope.submitExam();
            }
        };

        $scope.closeSuccessModal = function () {
            $scope.showSuccessModal = false;
            window.location.href = window.baseUrl + '/dashboard';
        };

        // Helper functions
        $scope.getQuestionType = function (question) {
            return 'Multiple Choice';
        };

        $scope.formatTime = function (seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        // Safe HTML filter
        $scope.safeHtml = function (text) {
            return $sce.trustAsHtml(text);
        };

        $scope.enterFullscreen = function () {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        };

        // Security features for demo
        $scope.setupSecurityFeatures = function () {
            // Prevent right click if disabled
            if ($scope.examData?.disable_right_click) {
                // document.addEventListener('contextmenu', function (e) {
                //     e.preventDefault();
                //     Toast.fire({
                //         type: 'warning',
                //         title: 'Action Restricted',
                //         msg: 'Right click is disabled during the exam.',
                //         timer: 2000
                //     });
                // });
            }

            // Prevent copy/paste if disabled
            if ($scope.examData?.disable_copy_paste) {
                document.addEventListener('copy', function (e) {
                    e.preventDefault();
                    Toast.fire({
                        type: 'warning',
                        title: 'Action Restricted',
                        msg: 'Copying is disabled during the exam.',
                        timer: 2000
                    });
                });

                document.addEventListener('paste', function (e) {
                    e.preventDefault();
                    Toast.fire({
                        type: 'warning',
                        title: 'Action Restricted',
                        msg: 'Pasting is disabled during the exam.',
                        timer: 2000
                    });
                });

                document.addEventListener('cut', function (e) {
                    e.preventDefault();
                    Toast.fire({
                        type: 'warning',
                        title: 'Action Restricted',
                        msg: 'Cutting is disabled during the exam.',
                        timer: 2000
                    });
                });
            }

            // Full screen mode
            if ($scope.examData?.full_screen_mode) {

                // Try to enter full screen
                $('#fsBtn').click();

                // Monitor full screen changes
                document.addEventListener('fullscreenchange', function () {
                    if (!document.fullscreenElement) {
                        Toast.fire({
                            type: 'warning',
                            title: 'Full Screen Required',
                            msg: 'Please return to full screen mode to continue the exam.'
                        });
                        // Re-enter full screen after delay
                        // $timeout($('#fsBtn').click(), 1000);
                    }
                });
            }

            // Detect tab switching
            let isTabActive = true;
            window.addEventListener('blur', function () {
                if ($scope.examData?.full_screen_mode && !$scope.showSuccessModal) {
                    isTabActive = false;
                    Toast.fire({
                        type: 'warning',
                        title: 'Stay Focused!',
                        msg: 'Please do not switch tabs during the exam.',
                        timer: 3000
                    });
                }
            });

            window.addEventListener('focus', function () {
                isTabActive = true;
            });
        };

        // Before unload warning
        window.addEventListener('beforeunload', function (e) {
            if (!$scope.isSubmitting && !$scope.showSuccessModal && $scope.answeredCount > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved answers. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Initialize after data is loaded
        $timeout(() => {
            if ($scope.examData) {
                $scope.setupSecurityFeatures();
            }
        }, 1000);

        // Cleanup
        $scope.$on('$destroy', function () {
            if ($scope.timerInterval) $interval.cancel($scope.timerInterval);
            if ($scope.autoSaveInterval) $interval.cancel($scope.autoSaveInterval);

            // Remove event listeners
            document.removeEventListener('contextmenu', () => { });
            document.removeEventListener('copy', () => { });
            document.removeEventListener('paste', () => { });
            document.removeEventListener('cut', () => { });
            document.removeEventListener('fullscreenchange', () => { });
            window.removeEventListener('blur', () => { });
            window.removeEventListener('focus', () => { });
            window.removeEventListener('beforeunload', () => { });
        });

        $scope.init();
    }
]);