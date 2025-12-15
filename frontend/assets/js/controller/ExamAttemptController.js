app.controller('ExamAttemptController', [
    "$scope", "$http", "$compile", "$timeout", "window", "$sce", "$interval",
    function ($scope, $http, $compile, $timeout, window, $sce, $interval) {
        // Initialize scope variables
        $scope.examId = window.getIdFromUrl();
        $scope.loading = true;
        $scope.error = null;
        $scope.examData = null;
        $scope.questions = [];
        $scope.currentQuestionIndex = 0;
        $scope.currentQuestion = null;
        $scope.timeRemaining = null;
        $scope.remainingCountdown = '00:00:00'
        $scope.timeRemainingFormatted = null;
        $scope.timerWarning = false;
        $scope.timeExpired = false;
        $scope.answeredCount = 0;
        $scope.flaggedCount = 0;
        $scope.showReviewModal = false;
        $scope.showSubmitConfirmation = false;
        $scope.showSuccessModal = false;
        $scope.submissionTime = null;
        $scope.timeTaken = 0;
        $scope.timeTakenFormatted = "00:00:00";
        $scope.examStartedAt = null;
        $scope.examEndTime = null;
        $scope.timerInterval = null;
        $scope.autoSaveInterval = null;
        $scope.isSubmitting = false;
        $scope.attemptId = null;
        $scope.estimatedScore = 0;
        $scope.showEligibilityModal = false;
        $scope.eligibilityError = null;
        $scope.currentDate = new Date();
        $scope.isAlreadyTaken = false;
        $scope.isProgress = false;
        $scope.isCompleted = false;
        $scope.isAbandoned = false;
        $scope.showExamStartModal = false;
        $scope.examStartWarning = false;
        $scope.isExamRunning = false;
        $scope.isCountdownInitialized = false;
        $scope.isTimerInitialized = false;
        $scope.selectedAnswers = null;


        // Initialize exam
        $scope.init = async function () {
            $scope.loading = true;
            $scope.showEligibilityModal = false;
            $scope.eligibilityError = null;
            // Preload warning audio
            $scope.startWarningAudio = await new Audio(window.baseUrl + '/frontend/assets/sounds/start_waring.mp3');
            $scope.endWarningAudio = await new Audio(window.baseUrl + '/frontend/assets/sounds/end_waring.mp3');
            $scope.startWarningAudio.volume = 0.3;
            $scope.endWarningAudio.volume = 0.3;

            // Play-pause once to give browser permission
            $scope.startWarningAudio.play().catch(() => { });
            $scope.endWarningAudio.play().catch(() => { });
            $scope.startWarningAudio.pause();
            $scope.endWarningAudio.pause();
            $scope.startWarningAudio.currentTime = 0;
            $scope.endWarningAudio.currentTime = 0;

            // First check eligibility
            $scope.checkUserEligibility();
        };

        // Check the user(student) eligibility for the exam
        $scope.checkUserEligibility = function () {
            $scope.loading = true;
            $scope.showEligibilityModal = false;
            $scope.eligibilityError = null;

            try {
                $http.get(window.baseUrl + "/API/exam/eligibility/" + $scope.examId)
                    .then(async function (response) {
                        $scope.loading = false;

                        if (response.data.status === 'success' && response.data.isEligible) {
                            $scope.isEligible = true;
                            await $scope.loadExamMetaData();
                            $scope.setupSecurityFeatures();
                        } else {
                            // Set error information
                            $scope.eligibilityError = {
                                code: response.data.code || 'UNKNOWN_ERROR',
                                msg: response.data.msg || 'An unknown error occurred',
                                title: getErrorTitle(response.data.code),
                                timestamp: new Date()
                            };

                            if (response.data.code === 'EXAM_NOT_STARTED') {
                                $scope.timeData = {
                                    start_time: response.data.start_time ? new Date(response.data.start_time) : null
                                };

                                $scope.remainingCountdown = Math.floor(
                                    ($scope.timeData.start_time - new Date()) / 1000
                                );
                                $scope.initializeExamCountdown(
                                    Math.max(0, $scope.remainingCountdown)
                                );
                            }

                            $scope.showEligibilityModal = true;
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        $scope.loading = false;
                        $scope.eligibilityError = {
                            code: 'NETWORK_ERROR',
                            msg: 'Failed to connect to server. Please check your internet connection.',
                            title: 'Connection Error',
                            timestamp: new Date()
                        };
                        $scope.showEligibilityModal = true;
                    });
            } catch (error) {
                $scope.loading = false;
                $scope.eligibilityError = {
                    code: 'CLIENT_ERROR',
                    msg: 'An error occurred while checking eligibility.',
                    title: 'Client Error',
                    timestamp: new Date()
                };
                $scope.showEligibilityModal = true;
                console.error('Eligibility check error:', error);
            }
        };

        // Helper function to get error titles
        function getErrorTitle(errorCode) {
            const errorTitles = {
                'EXAM_NOT_FOUND': 'Exam Not Found',
                'EXAM_NOT_PUBLISHED': 'Exam Not Published',
                'EXAM_CANCELED': 'Exam Canceled',
                'EXAM_NOT_STARTED': 'Exam Not Started',
                'EXAM_ENDED': 'Exam Ended',
                'NOT_REGISTERED': 'Not Registered',
                'MAX_ATTEMPTS_EXCEEDED': 'Maximum Attempts Exceeded',
                'NETWORK_ERROR': 'Network Error',
                'CLIENT_ERROR': 'Client Error',
                'UNKNOWN_ERROR': 'Unknown Error'
            };

            return errorTitles[errorCode] || 'Access Denied';
        }

        // Method to retry eligibility check
        $scope.retryEligibilityCheck = function () {
            $scope.checkUserEligibility();
        };

        // Method to contact support
        $scope.contactSupport = function () {
            // Implement support contact logic
            window.location.href = window.baseUrl + '/support';
        };

        // Load exam data
        $scope.loadExamMetaData = async function () {
            try {
                // Load exam details
                const examResponse = await $http.get(
                    window.baseUrl + '/API/exam/attempt/meta_data/' + $scope.examId
                );

                if (examResponse.data.status === 'success') {
                    const data = examResponse.data.exam_info

                    $scope.examData = {
                        id: data.id,
                        title: data.title,
                        code: data.code.replace(/ /g, "_"),
                        duration: data.duration,
                        total_questions: data.total_questions,
                        total_marks: data.total_marks,
                        instructions: $sce.trustAsHtml(data.instructions || ''),
                        schedule_type: data.schedule_type,

                        start_time: data.start_time ? new Date(data.start_time) : null,
                        end_time: data.start_time ? new Date(new Date(data.start_time).getTime() + data.duration * 60 * 1000) : null,
                        started_at: (data.schedule_type === 'anytime' && data.started_at) ? new Date(data.started_at) : new Date(),

                        max_attempts: data.max_attempts > 0 ? data.max_attempts : 1,
                        allow_retake: data.allow_retake,
                        total_attempts: data.total_attempts,
                        disable_right_click: data.disable_right_click,

                        isAlreadyTaken: data.isAlredyTaken,
                        isProgress: data.isProgress,
                        isCompleted: data.isCompleted,
                        isAbandoned: data.isAbandoned,
                    };
                    const now = new Date();

                    if (data.allow_retake && data.max_attempts >= data.total_attempts) {
                        // ANYTIME
                        if ($scope.examData.schedule_type === 'anytime') {
                            $scope.showExamStartModal = true;
                        }

                        // SCHEDULED
                        if ($scope.examData.schedule_type === 'scheduled') {

                            if (now < $scope.examData.start_time) {
                                $scope.isExamStarted = false;
                                $scope.isExamEnded = false;
                            } else if (now >= $scope.examData.start_time && now <= $scope.examData.end_time) {
                                $scope.showExamStartModal = true;

                            } else if (now > $scope.examData.end_time) {
                                $scope.isExamStarted = false;
                                $scope.isExamEnded = true;
                            }
                        }
                    }

                    $scope.loading = false;
                    $scope.$apply();
                } else {
                    throw new Error(examResponse.data.message || 'Failed to load exam data');
                }
            } catch (error) {
                console.error('Error loading exam:', error);
            }
        };
        // Start Exam
        $scope.startExam = async () => {
            $scope.isExamStarted = true;
            $scope.isExamEnded = false;
            $scope.showExamStartModal = false;
            await $scope.loadExamData();
            $scope.isExamRunning = true;
            $scope.setupSecurityFeatures();
        }

        // load other exam data
        $scope.loadExamData = async function () {
            try {
                // Load exam details
                const examResponse = await $http.get(
                    window.baseUrl + '/API/exam/attempt/' + $scope.examId
                );

                if (examResponse.data.status === 'success') {
                    const data = examResponse.data.rest_exam_info

                    $scope.examData = angular.extend($scope.examData || {}, {
                        passing_marks: data.passing_marks,
                        passing_persentage: (data.passing_marks / data.total_marks) * 100,
                        shuffle_questions: data.shuffle_questions,
                        shuffle_options: data.shuffle_options,
                        full_screen_mode: data.full_screen_mode,
                        disable_copy_paste: data.disable_copy_paste,
                        show_results_immediately: data.show_results_immediately,
                        attempt_id: data.attempt_id
                    });

                    $scope.attemptId = data.attempt_id;

                    $scope.selectedAnswers = examResponse.data.answers;


                    // Process questions
                    $scope.processQuestions(examResponse.data.questions, examResponse.data.sections);
                    // Initialize timer
                    // $scope.timeRemaining = $scope.examData.duration * 60;
                    let endTime;

                    if ($scope.examData.schedule_type === 'scheduled') {
                        const startTime = new Date($scope.examData.start_time);
                        endTime = new Date(startTime.getTime() + $scope.examData.duration * 60 * 1000);
                    } else {
                        const startTime = new Date($scope.examData.started_at);
                        endTime = new Date(startTime.getTime() + $scope.examData.duration * 60 * 1000);
                    }

                    const currentTime = new Date();

                    // Time remaining in seconds
                    $scope.timeRemaining = Math.max(0, Math.floor((endTime - currentTime) / 1000));
                    $scope.initializeTimer($scope.timeRemaining);

                    $scope.loading = false;
                    $scope.$apply();
                } else {
                    throw new Error(examResponse.data.message || 'Failed to load exam data');
                }
            } catch (error) {
                console.error('Error loading exam:', error);
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

                // find selected answer ONCE (safe)
                const selected = $scope.selectedAnswers.find(
                    ans => ans.question_id === question.id
                ) || {};

                if (selected) {
                    $scope.answeredCount++
                };
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
                    answer: selected.answer || null,
                    flagged: selected.flagged || false,
                    order: index + 1,
                    sectionIds: question.sectionIconsods || [],
                    grid: question.grid || 1,
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
                    question.sectionSecondDescription = section.secondDescription;
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

            $scope.reviewSections = reviewSectionsOrder;

            // Sort questions inside each section by original question order
            $scope.reviewSections.forEach(section => {
                if (section.questions) {
                    section.questions = section.questions.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
                }
            });
        };

        // Initialize exam countdown
        $scope.initializeExamCountdown = function (timeRemainingSeconds) {
            if (!$scope.isCountdownInitialized) {
                $scope.isCountdownInitialized = true;
                $scope.remainingCountdown = timeRemainingSeconds;
                $scope.updateTimerDisplay($scope.remainingCountdown);

                $scope.examStartTime = new Date();
                $scope.examStartTime.setSeconds($scope.examStartTime.getSeconds() + $scope.remainingCountdown);

                $scope.timerInterval = $interval(() => {
                    $scope.remainingCountdown--;
                    $scope.updateTimerDisplay($scope.remainingCountdown);

                    // Check for warnings
                    if ($scope.remainingCountdown <= 300 && !$scope.examStartWarning) { // 5 minutes
                        $scope.examStartWarning = true;
                        // Play warning sound
                        $scope.startWarningAudio.play().catch(() => { });
                    }

                    // Check if time expired
                    if ($scope.remainingCountdown < 0) {
                        $interval.cancel($scope.timerInterval);
                        $scope.retryEligibilityCheck();
                    }
                }, 1000);
            }
        }

        // Initialize timer
        $scope.initializeTimer = function (timeRemainingSeconds) {
            if (!$scope.isTimerInitialized) {
                $scope.isTimerInitialized = true;
                $scope.timeRemaining = timeRemainingSeconds;
                $scope.updateTimerDisplay($scope.timeRemaining);

                $scope.examEndTime = new Date();
                $scope.examEndTime.setSeconds($scope.examEndTime.getSeconds() + $scope.timeRemaining);

                $scope.timerInterval = $interval(() => {
                    if (!$scope.timeExpired) $scope.timeRemaining--; // Decrease time remaining by 1 second
                    $scope.updateTimerDisplay($scope.timeRemaining);

                    // Check for warnings
                    if ($scope.timeRemaining === 600 && !$scope.timerWarning) { // 5 minutes
                        // $scope.timerWarning = true;
                        $scope.endWarningAudio.play().catch(() => { });
                        Toast.fire({
                            type: 'warning',
                            title: 'Exam Warning',
                            text: 'You have 10 minutes remaining!'
                        })
                    }

                    if ($scope.timeRemaining === 300 && !$scope.timerWarning) { // 5 minutes
                        // $scope.timerWarning = true;
                        $scope.endWarningAudio.play().catch(() => { });
                        Toast.fire({
                            type: 'warning',
                            title: 'Exam Warning',
                            text: 'You have 5 minutes remaining!'
                        })
                    }

                    if ($scope.timeRemaining === 60 && !$scope.timerWarning) { // 5 minutes
                        // $scope.timerWarning = true;
                        $scope.endWarningAudio.play().catch(() => { });
                        Toast.fire({
                            type: 'warning',
                            title: 'Exam Warning',
                            text: 'You have 5 minutes remaining!'
                        })
                    }

                    if ($scope.timeRemaining <= 60 && !$scope.timerWarning) { // 5 minutes
                        $scope.timerWarning = true;
                        // Play warning sound
                        $scope.endWarningAudio.play().catch(() => { });
                    }

                    // Check if time expired
                    if ($scope.timeRemaining <= 0) {
                        $scope.timeExpired = true;
                        $scope.showSuccessModal = true;
                        $interval.cancel($scope.timerInterval);
                        // $scope.forceSubmit();
                    }
                }, 1000);
            }
        };

        // Update timer display
        $scope.updateTimerDisplay = function (time) {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;

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

        // Update counts
        $scope.updateCounts = function () {
            $scope.answeredCount = $scope.questions.filter(q => q.answer !== null).length;
            $scope.flaggedCount = $scope.questions.filter(q => q.flagged).length;
            $scope.progressPercentage = $scope.examData.total_questions ? Math.min(100, Math.round(($scope.answeredCount / $scope.examData.total_questions) * 100)) : 0
            $scope.calculateEstimatedScore();
        };

        // Navigation
        $scope.goToQuestion = function (index) {
            if (index >= 0 && index < $scope.questions.length) {
                $scope.currentQuestionIndex = index;
                $scope.currentQuestion = $scope.questions[index];
                console.log($scope.currentQuestion)
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

        // Save progress
        $scope.saveProgress = async function () {
            if ($scope.isSubmitting || $scope.showSuccessModal) return;

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

            } catch (error) {
                console.error('Error saving progress:', error);
            }
        };

        // Question actions
        $scope.selectAnswer = function (answer) {
            const formData = new FormData();
            formData.append('answer', answer);
            formData.append('flagged', false);

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

        // Security features for demo
        $scope.setupSecurityFeatures = function () {
            // Prevent right click if disabled
            if ($scope.examData.disable_right_click) {
                document.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    Toast.fire({
                        type: 'warning',
                        title: 'Action Restricted',
                        msg: 'Right click is disabled during the exam.',
                        timer: 2000
                    });
                });
            }

            if (!$scope.isExamRunning) return;

            // Prevent copy/paste if disabled
            if ($scope.examData.disable_copy_paste) {
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
            if ($scope.examData.full_screen_mode) {
                // Try to enter full screen
                const enterFullscreen = function () {
                    const elem = document.documentElement;
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    }
                };

                enterFullscreen();

                // Monitor full screen changes
                document.addEventListener('fullscreenchange', function () {
                    if (!document.fullscreenElement) {
                        Toast.fire({
                            type: 'warning',
                            title: 'Full Screen Required',
                            msg: 'Please return to full screen mode to continue the exam.'
                        });
                        // Re-enter full screen after delay
                        $timeout(function () {
                            enterFullscreen();
                        }, 1000);
                    }
                });
            }

            // Detect tab switching
            $scope.tabSwitchCount = 0;
            const maxTabSwitch = 3;
            let isTabActive = true;
            window.addEventListener('blur', function () {
                isTabActive = false;

                $scope.tabSwitchCount++;

                Toast.fire({
                    type: 'warning',
                    title: 'Stay Focused!',
                    msg: `Please do not switch tabs during the exam. (${$scope.tabSwitchCount}/${maxTabSwitch})`,
                    timer: 3000
                });

                if ($scope.tabSwitchCount >= maxTabSwitch) {
                    $scope.$apply(() => {
                        $scope.endExam();
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