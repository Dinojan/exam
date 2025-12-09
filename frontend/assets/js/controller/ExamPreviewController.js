app.controller('ExamPreviewController', [
    "$scope", "$http", "$compile", "$timeout", "window", "questionEditorModalController",
    function ($scope, $http, $compile, $timeout, window, questionEditorModalController) {
        $scope.location = $scope.location || {};
        $scope.location.exam = window.getIdFromUrl();
        $scope.dropdownOpen = false;
        $scope.questionsDisplayMode = 'all';
        $scope.editingQuestionId = null;
        $scope.organaizedSections = [];
        $scope.previewDisplayMode = 'all'; // 'all' or 'sections'
        $scope.activePreviewSection = null;
        $scope.previewQuestionsPerPage = 10;
        $scope.currentPreviewQuestionPage = 0;
        $scope.reviewSections = [];
        $scope.originalAllPreviewSections = null;
        $scope.originalSectionQuestions = {};
        $scope.cachedPreviewSections = [];
        $scope.cachedPage = null;
        $scope.currentQuestion = null;
        $scope.currentQuestionIndex = null;

        // Initialize arrays to prevent undefined errors
        $scope.allQuestions = [];
        $scope.sections = [];
        $scope.displayQuestions = [];
        $scope.previewDisplayQuestions = [];
        $scope.previewDisplaySections = [];
        $scope.currentPreviewPageSections = [];


        // Initialize function
        $scope.init = async function () {
            await $scope.loadExamData();
            $scope.updateStepCompletion();
        };

        $scope.loadExamData = async () => {
            try {
                const response = await $http({
                    url: `${window.baseUrl}/API/exam/data/${$scope.location.exam}`,
                    method: 'GET'
                });

                if (response.data.status === 'success') {
                    const examInfo = response.data.exam_info;
                    const examSettings = response.data.settings;
                    const sections = response.data.sections;
                    const questions = response.data.questions;

                    $scope.examData = {
                        title: examInfo.title,
                        code: examInfo.code,
                        duration: examInfo.duration,
                        total_marks: examInfo.total_marks,
                        passing_marks: examInfo.passing_marks,
                        instructions: formatInstructions(examInfo.instructions),
                        status: examInfo.status,
                        schedule_type: examSettings.schedule_type,
                        start_time: examSettings.start_time,
                        end_time: (function () {
                            var start = new Date(examSettings.start_time);
                            return new Date(start.getTime() + parseInt(examInfo.duration) * 60000).toISOString();
                        })(),
                        shuffle_questions: examSettings.shuffle_questions,
                        shuffle_options: examSettings.shuffle_options,
                        show_results_immediately: examSettings.show_results_immediately,
                        enable_proctoring: examSettings.enable_proctoring,
                        full_screen_mode: examSettings.full_screen_mode,
                        disable_copy_paste: examSettings.disable_copy_paste,
                        disable_right_click: examSettings.disable_right_click,
                        allow_retake: examSettings.allow_retake,
                        max_attempts: examSettings.max_attempts,
                        allow_navigation: true,
                        published_at: null
                    };

                    $scope.sections = sections || [];
                    $scope.allQuestions = questions || [];

                    $scope.processQuestions();
                    $scope.calculateTotals();

                    $scope.currentStep = 1;

                    $scope.questionsDisplayMode = 'all';
                    $scope.activeSection = $scope.sections.length > 0 ? $scope.sections[0] : null;
                    $scope.questionsPerPage = 10;
                    $scope.currentQuestionPage = 0;

                    $scope.updateQuestionsDisplay();
                    // $scope.getSectionaizedQuestions();

                    $scope.$applyAsync();
                }
            } catch (err) {
                console.error(err);
            }
        };

        const formatInstructions = (instructions) => {
            if (!instructions) return '';
            return instructions.replace(/(\s|^)(\d+\.|[a-z]\.|\([a-z]\))\s+/gi, '\n$2 ');
        };

        // Process questions and nest them in sections
        $scope.processQuestions = function () {
            // Reset section questions
            if (!$scope.sections) return;

            $scope.sections.forEach(function (section) {
                section.questions = [];
            });

            // If no questions, return
            if (!$scope.allQuestions || $scope.allQuestions.length === 0) return;

            // Assign questions to sections
            $scope.allQuestions.forEach(function (question) {
                // Get section names for display
                var sectionNames = [];
                var hasSectionIds = false;

                if (question.sectionIds && question.sectionIds.length > 0) {
                    hasSectionIds = true;
                    question.sectionIds.forEach(function (sectionId) {
                        var section = $scope.sections.find(function (s) {
                            return s.id === sectionId;
                        });

                        if (section) {
                            sectionNames.push(section.title);

                            // Add question to section
                            section.questions = section.questions || [];
                            if (!section.questions.find(q => q.id === question.id)) {
                                section.questions.push(question);
                            }
                        }
                    });
                }

                question.sectionNames = sectionNames.join(', ');
                $scope.organaizedSections = $scope.sections;
            });
        };

        // Calculate totals
        $scope.calculateTotals = function () {
            if (!$scope.allQuestions || $scope.allQuestions.length === 0) {
                $scope.totalQuestions = 0;
                $scope.totalMarks = 0;
                return;
            }

            $scope.totalQuestions = $scope.allQuestions.length;
            $scope.totalMarks = $scope.allQuestions.reduce(function (total, q) {
                return total + (parseInt(q.marks) || 1);
            }, 0);
        };

        // Get count of questions with images
        $scope.getQuestionsWithImages = function () {
            if (!$scope.allQuestions) return 0;
            return $scope.allQuestions.filter(function (q) {
                return q && q.image;
            }).length;
        };

        $scope.selectPerPage = function (event, num) {
            event.stopPropagation();
            $scope.questionsPerPage = num;
            $scope.dropdownOpen = false;
            $scope.updateQuestionsDisplay();
        };

        // Update questions display
        $scope.updateQuestionsDisplay = function () {
            if (!$scope.allQuestions) {
                $scope.displayQuestions = [];
                return;
            }

            if ($scope.questionsDisplayMode === 'sections' && $scope.activeSection) {
                // Show only questions from active section
                $scope.displayQuestions = ($scope.activeSection.questions || []);
            } else {
                // Show all questions
                $scope.displayQuestions = $scope.allQuestions;
            }

            // Update pagination
            $scope.updateQuestionPagination();
        };

        // Update question pagination
        $scope.updateQuestionPagination = function () {
            if (!$scope.displayQuestions) {
                $scope.questionPages = [];
                return;
            }

            var totalPages = Math.ceil($scope.displayQuestions.length / $scope.questionsPerPage);
            $scope.questionPages = new Array(totalPages).fill().map(function (_, i) {
                return i;
            });

            // Ensure current page is valid
            if ($scope.currentQuestionPage >= totalPages) {
                $scope.currentQuestionPage = Math.max(0, totalPages - 1);
            }
        };

        // Get questions for current page
        $scope.getCurrentPageQuestions = function () {
            if (!$scope.displayQuestions || $scope.displayQuestions.length === 0) {
                return [];
            }

            var start = $scope.currentQuestionPage * $scope.questionsPerPage;
            var end = start + parseInt($scope.questionsPerPage);
            return $scope.displayQuestions.slice(start, end);
        };

        // Section selection
        $scope.selectSection = function (section) {
            $scope.questionsDisplayMode = 'sections';
            $scope.activeSection = section;
            $scope.currentQuestionPage = 0;
            $scope.updateQuestionsDisplay();
        };

        $scope.editQuestion = function (id) {
            if (isPastStartTime($scope.examData.start_time)) {
                Toast.fire({
                    type: 'error',
                    title: 'Exam has started',
                    msg: 'You cannot edit questions after the exam has started'
                })
                return;
            }
            $scope.editingQuestionId = id;
            let question = $scope.allQuestions.find(q => q.id === id);
            question.correctAnswer = question.correctAnswer.toUpperCase();
            $scope.currentQuestion = question;
        };

        $scope.saveQuestion = async function () {
            if (!$scope.currentQuestion.question) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'Please enter question text' });
                return false;
            }

            const validOptions = $scope.currentQuestion.options.filter(opt => opt.text || opt.image);
            if (validOptions.length < 4) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'All options are required' });
                return false;
            }

            if ($scope.currentQuestion.correctAnswer === null || $scope.currentQuestion.correctAnswer === undefined) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'Please select a correct answer' });
                return false;
            }

            // API URI
            const apiUrl = window.baseUrl + '/API/questions/edit_question/' + $scope.currentQuestion.id;
            const formData = $(`#questionForm${$scope.currentQuestion.id}`).serialize();
            try {
                const response = await $http({
                    url: apiUrl,
                    data: formData,
                    method: 'POST',
                });

                if (response.data.status === 'success') {
                    Toast.popover({ type: 'close' })
                    Toast.fire({ type: 'success', title: 'Success!', msg: response.data.msg || 'Question updated successfully' });

                    let updated = response.data.question;
                    updated.correctAnswer = updated.answer;

                    // Update currentQuestion
                    $scope.currentQuestion = updated;
                    $scope.currentQuestionIndex = $scope.allQuestions.findIndex(q => q.id === updated.id);
                    $scope.allQuestions[$scope.currentQuestionIndex] = angular.copy(updated);
                    $scope.currentQuestion = null
                    $scope.editingQuestionId = null;
                    $scope.$applyAsync();
                } else {
                    Toast.fire({ type: 'error', title: 'Error!', msg: response.data.msg });
                }
            } catch (error) {
                Toast.fire({ type: 'error', title: 'Error!', msg: 'Something went wrong. Failed to update the question.' });
                console.error(error);
            };
        };

        $scope.cancelEdit = function () {
            $scope.editingQuestionId = null;
        };

        // Transform questions into reviewSections structure
        $scope.getSectionaizedQuestions = function () {
            if (!$scope.sections) return;

            // Reset questions in each section
            $scope.sections.forEach(section => section.questions = []);

            if (!$scope.allQuestions || $scope.allQuestions.length === 0) {
                $scope.reviewSections = $scope.sections;
                $scope.updatePreviewQuestionsDisplay();
                $scope.updatePreviewQuestionPagination();
                return;
            }

            let reviewSectionsMap = {};
            let reviewSectionsOrder = [];

            $scope.allQuestions.forEach(question => {
                let sectionNames = [];
                let assigned = false;

                // Assign to existing sections if sectionIds exist and match
                if (question.sectionIds && question.sectionIds.length > 0) {
                    for (let counter = 0; counter < question.sectionIds.length; counter++) {
                        let section = $scope.sections.find(s => s.id === question.sectionIds[counter]);
                        if (section) {
                            section.questions = section.questions || [];
                            section.questions.push(question);
                            sectionNames.push(section.title);
                            assigned = true;

                            // Add to reviewSections in first occurrence order
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
                        exam_id: +$scope.location.exam,
                        title: `Section ${newSectionId}`,
                        description: '',
                        questions: [question],
                        order: $scope.sections.length + 1,
                        second_description: ''
                    };

                    $scope.sections.push(newSection);
                    sectionNames.push(newSection.title);

                    // Add new section to reviewSections in order
                    reviewSectionsMap[newSection.id] = newSection;
                    reviewSectionsOrder.push(newSection);
                }

                question.sectionNames = sectionNames.join(', ');
            });

            // Assign reviewSections in the order of sections
            $scope.reviewSections = reviewSectionsOrder;

            // Sort questions inside each section by original question order
            $scope.reviewSections.forEach(section => {
                if (section.questions) {
                    section.questions = section.questions
                        .slice()
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                }
            });

            $scope.updatePreviewQuestionsDisplay();
            $scope.updatePreviewQuestionPagination();
        };

        // Toggle preview display mode
        $scope.togglePreviewDisplayMode = function () {
            $scope.previewDisplayMode = $scope.previewDisplayMode === 'all' ? 'sections' : 'all';
            $scope.updatePreviewQuestionsDisplay();
        };

        // Select section in preview mode
        $scope.selectPreviewSection = function (section) {
            $scope.activePreviewSection = section;
            $scope.previewDisplayMode = 'sections';
            $scope.currentPreviewQuestionPage = 0;
            $scope.updatePreviewQuestionsDisplay();
        };

        // Update preview display based on current mode
        $scope.updatePreviewQuestionsDisplay = function () {
            if ($scope.previewDisplayMode === 'sections' && $scope.activePreviewSection) {
                // Show only questions from active section
                $scope.previewDisplayQuestions = $scope.activePreviewSection.questions || [];
            } else {
                // Show all questions (flatten all preview sections)
                $scope.previewDisplayQuestions = [];
                // Use a copy instead of direct assignment
                $scope.previewDisplaySections = angular.copy($scope.reviewSections);

                $scope.previewDisplaySections.forEach(section => {
                    if (section.questions && section.questions.length > 0) {
                        $scope.previewDisplayQuestions.push(...section.questions);
                    }
                });

                $scope.storeOriginalPreviewOrder();
            }

            $scope.currentPreviewPageSections = $scope.getCurrentPreviewPageSections()
            $scope.updatePreviewQuestionPagination();

            // Force AngularJS to update UI
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };
        // Update preview question pagination
        $scope.updatePreviewQuestionPagination = function () {
            if (!$scope.previewDisplayQuestions || $scope.previewDisplayQuestions.length === 0) {
                $scope.previewQuestionPages = [];
                $scope.currentPreviewQuestionPage = 0;
                return;
            }

            var totalPages = Math.ceil($scope.previewDisplayQuestions.length / $scope.previewQuestionsPerPage);
            $scope.previewQuestionPages = new Array(totalPages).fill().map((_, i) => i);

            if ($scope.currentPreviewQuestionPage >= totalPages) {
                $scope.currentPreviewQuestionPage = Math.max(0, totalPages - 1);
            }
        };

        // Get questions for current preview page
        $scope.getCurrentPreviewPageQuestions = function () {
            if (!$scope.previewDisplayQuestions || $scope.previewDisplayQuestions.length === 0) {
                return [];
            }

            var start = $scope.currentPreviewQuestionPage * $scope.previewQuestionsPerPage;
            var end = start + parseInt($scope.previewQuestionsPerPage);
            return $scope.previewDisplayQuestions.slice(start, end);
        };

        $scope.cachedPreviewSections = [];

        // Get sections for current preview page
        $scope.getCurrentPreviewPageSections = function () {
            if (!$scope.previewDisplaySections || $scope.previewDisplaySections.length === 0) {
                return [];
            }

            var start = $scope.currentPreviewQuestionPage * $scope.previewQuestionsPerPage;
            var end = start + parseInt($scope.previewQuestionsPerPage);

            // Use cache if available
            if ($scope.cachedPage === $scope.currentPreviewQuestionPage && $scope.cachedPreviewSections.length) {
                return $scope.cachedPreviewSections;
            }

            var resultSections = [];
            var questionCounter = 0;
            var globalCounter = 0;

            // Loop through sections
            for (var s = 0; s < $scope.previewDisplaySections.length; s++) {
                var section = $scope.previewDisplaySections[s];
                var totalQuestions = section.questions.length;

                // Skip sections before current page
                if (questionCounter + totalQuestions <= start) {
                    questionCounter += totalQuestions;
                    globalCounter += totalQuestions;
                    continue;
                }

                var sectionCopy = angular.copy(section);

                // Determine slice range for this section
                var sectionStart = Math.max(0, start - questionCounter);
                var sectionEnd = Math.min(totalQuestions, end - questionCounter);

                // Slice questions for this page
                var slicedQuestions = section.questions.slice(sectionStart, sectionEnd);

                // Shuffle questions if needed
                if ($scope.examData.shuffle_questions) {
                    for (let i = slicedQuestions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [slicedQuestions[i], slicedQuestions[j]] = [slicedQuestions[j], slicedQuestions[i]];
                    }
                }

                // Assign global numbering
                slicedQuestions.forEach((q, index) => {
                    q._globalNumber = globalCounter + sectionStart + index + 1;
                });

                sectionCopy.questions = slicedQuestions;
                resultSections.push(sectionCopy);

                globalCounter += totalQuestions;
                questionCounter += totalQuestions;

                if (questionCounter >= end) break;
            }

            // Cache result
            $scope.cachedPreviewSections = resultSections;
            $scope.cachedPage = $scope.currentPreviewQuestionPage;

            // Shuffle options for the sliced questions
            resultSections.forEach(sec => {
                sec.questions.forEach(q => {
                    if (q.options) {
                        const prevSelected = q.selectedOption !== undefined ? q.options[q.selectedOption] : null;

                        if ($scope.examData.shuffle_options) {
                            const shuffledOptions = [...q.options];
                            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                            }
                            q.options = shuffledOptions;
                        } else {
                            q.options.sort((a, b) => a.order - b.order);
                        }

                        // Restore selected option
                        if (prevSelected !== null) {
                            const newIndex = q.options.findIndex(o => o === prevSelected);
                            q.selectedOption = newIndex !== -1 ? newIndex : undefined;
                        }
                    }
                });
            });

            console.log(resultSections)
            return resultSections;
        };

        // Preview navigation functions
        $scope.previousPreviewQuestionPage = function () {
            if ($scope.currentPreviewQuestionPage > 0) {
                $scope.currentPreviewQuestionPage--;
                $scope.currentPreviewPageSections = $scope.getCurrentPreviewPageSections()
            }
        };

        $scope.nextPreviewQuestionPage = function () {
            if ($scope.currentPreviewQuestionPage < $scope.previewQuestionPages.length - 1) {
                $scope.currentPreviewQuestionPage++;
                $scope.currentPreviewPageSections = $scope.getCurrentPreviewPageSections()
            }
        };

        // Select option in preview mode
        $scope.selectPreviewOption = function (questionId, oIndex) {
            const question = $scope.previewDisplayQuestions.find(q => q.id === questionId);
            if (question) {
                question.selectedOption = oIndex;

                // Also update in the main question array for consistency
                const mainQuestion = $scope.allQuestions.find(q => q.id === questionId);
                if (mainQuestion) {
                    mainQuestion.selectedOption = oIndex;
                }
            }
        };

        $scope.storeOriginalPreviewOrder = function () {
            $scope.originalPreviewSections = angular.copy($scope.previewDisplaySections);
        };


        // Shuffle questions for preview
        $scope.shufflePreviewQuestions = function () {

            if (!$scope.originalAllPreviewSections) {
                $scope.originalAllPreviewSections = angular.copy($scope.previewDisplaySections);
            }

            $scope.previewDisplaySections.forEach(sec => {
                if (!$scope.originalSectionQuestions[sec.id]) {
                    $scope.originalSectionQuestions[sec.id] = angular.copy(sec.questions);
                }
            });

            if (!$scope.examData.shuffle_questions) {

                if ($scope.previewDisplayMode === 'sections' && $scope.activePreviewSection) {

                    // Restore ONLY that section's original questions
                    const original = $scope.originalSectionQuestions[$scope.activePreviewSection.id];
                    if (original) {
                        $scope.activePreviewSection.questions =
                            angular.copy(original);
                    }

                } else {

                    // Restore entire set
                    if ($scope.originalAllPreviewSections) {
                        $scope.previewDisplaySections =
                            angular.copy($scope.originalAllPreviewSections);
                    }
                }
                $scope.currentPreviewPageSections = $scope.getCurrentPreviewPageSections()
                $scope.updatePreviewQuestionsDisplay();
                return;
            }

            // Shuffle ON
            if ($scope.previewDisplayMode === 'sections' && $scope.activePreviewSection) {

                let questions = $scope.activePreviewSection.questions;
                for (let counter = questions.length - 1; counter > 0; counter--) {
                    const randomIndex = Math.floor(Math.random() * (counter + 1));
                    [questions[counter], questions[randomIndex]] = [questions[randomIndex], questions[counter]];
                }

            } else {
                let sections = $scope.previewDisplaySections;
                for (let counter = sections.length - 1; counter > 0; counter--) {
                    const randomIndex = Math.floor(Math.random() * (counter + 1));
                    [sections[counter], sections[randomIndex]] = [sections[randomIndex], sections[counter]];
                }
            }

            $scope.currentPreviewPageSections = $scope.getCurrentPreviewPageSections()
            $scope.updatePreviewQuestionsDisplay();
        };



        // Shuffle options for preview
        $scope.shufflePreviewOptions = function () {
            $scope.previewDisplayQuestions.forEach(question => {
                if (question.options) {
                    // Store the previously selected option
                    const prevSelected = question.selectedOption !== undefined ? question.options[question.selectedOption] : null;
                    if ($scope.examData.shuffle_options) {

                        // Shuffle options
                        const shuffledOptions = [...question.options];
                        for (let i = shuffledOptions.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                        }
                        question.options = shuffledOptions;
                    }

                    if (!$scope.examData.shuffle_options) {
                        const reOrderedOptions = [...question.options];
                        let orderedOptions = [];
                        for (let index = 0; index < reOrderedOptions.length; index++) {
                            const option = reOrderedOptions.find(o => o.order === index + 1);
                            orderedOptions[index] = option;
                        }
                        question.options = orderedOptions;
                    }

                    // Restore selected option
                    if (prevSelected !== null) {
                        const newIndex = question.options.findIndex(o => o === prevSelected);
                        question.selectedOption = newIndex !== -1 ? newIndex : undefined;
                    }
                }
            });
        };

        // Initialize Step 4
        $scope.initializeStep4 = function () {
            // Generate reviewSections structure
            $scope.getSectionaizedQuestions();

            // Set default active section if in sections mode
            if ($scope.previewDisplayMode === 'sections' && $scope.reviewSections.length > 0) {
                $scope.activePreviewSection = $scope.reviewSections[0];
            }

            // Update display
            $scope.updatePreviewQuestionsDisplay();
            $scope.updatePreviewQuestionPagination();
        };

        // Question page navigation
        $scope.goToQuestionPage = function (pageIndex) {
            $scope.currentQuestionPage = pageIndex;
        };

        $scope.previousQuestionPage = function () {
            if ($scope.currentQuestionPage > 0) {
                $scope.currentQuestionPage--;
            }
        };

        $scope.nextQuestionPage = function () {
            if ($scope.currentQuestionPage < $scope.questionPages.length - 1) {
                $scope.currentQuestionPage++;
            }
        };

        $scope.selectOption = function (questionId, oIndex) {
            const question = $scope.allQuestions.find(q => q.id === questionId);
            question.selectedOption = oIndex;
            let realIndex = $scope.allQuestions.findIndex(q => q.id === question.id);
            if (realIndex !== -1) {
                $scope.allQuestions[realIndex].selectedOption = oIndex;
            }
        };

        // Step navigation
        $scope.nextStep = function () {
            if ($scope.currentStep < 5) {
                $scope.currentStep++;
                $scope.updateStepCompletion();
            }
        };

        $scope.previousStep = function () {
            if ($scope.currentStep > 1) {
                $scope.currentStep--;
            }
        };

        // Update step completion status
        $scope.updateStepCompletion = function () {
            $scope.step1Completed = $scope.isBasicInfoComplete();
            $scope.step2Completed = $scope.totalQuestions > 0;
            $scope.step3Completed = $scope.areSettingsValid();
            $scope.step4Completed = $scope.step1Completed && $scope.step2Completed && $scope.step3Completed;
            $scope.step5Completed = $scope.examData && $scope.examData.status === 'published';

            if ($scope.currentStep === 4) {
                $scope.initializeStep4();
            }
        };

        // Validation functions
        $scope.isBasicInfoComplete = function () {
            return $scope.examData &&
                $scope.examData.title &&
                $scope.examData.code &&
                ($scope.examData.duration > 0) &&
                ($scope.totalQuestions > 0);
        };

        $scope.areSettingsValid = function () {
            if (!$scope.examData) return false;

            // Basic settings validation
            return $scope.examData.total_marks > 0 &&
                $scope.examData.passing_marks <= $scope.examData.total_marks;
        };

        $scope.isReadyToPublish = function () {
            return $scope.isBasicInfoComplete() &&
                $scope.totalQuestions > 0 &&
                $scope.areSettingsValid();
        };

        // Proceed to publish exam
        function proceedPublish() {
            $http.post(window.baseUrl + '/API/publish_exam/' + $scope.location.exam)
                .then((response) => {

                    if (response.data.status === 'success') {
                        Toast.fire({
                            type: 'success',
                            title: 'Exam Published!',
                            msg: 'Exam published successfully!'
                        });

                        $scope.examData.status = $scope.examData.schedule_type === 'scheduled' ? 'scheduled' : 'published';
                        $scope.examData.published_at = new Date().toISOString();
                        $scope.step5Completed = true;

                    } else {
                        Toast.fire({
                            type: 'error',
                            title: 'Failed!',
                            msg: response.data.msg || 'Something went wrong.'
                        });
                    }
                    $scope.$applyAsync();
                })
                .catch(() => {
                    Toast.fire({
                        type: 'error',
                        title: 'Server Error',
                        msg: 'API not response'
                    });
                });
        }

        // Publish exam
        $scope.publishExam = function () {

            if (!$scope.isReadyToPublish()) {
                Toast.fire({
                    type: 'error',
                    title: 'Cannot publish exam',
                    msg: 'Please complete all requirements before publishing.'
                });
                return;
            }

            // If exam was previously cancelled
            if ($scope.examData.status === 'canceled') {
                Toast.popover({
                    type: 'confirm',
                    title: 'Exam Previously Cancelled!',
                    titleColor: '#ca8a04',
                    content: `
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;color:#ca8a04"></i><br><br>
                        <p>This exam was cancelled earlier.<br>
                        Do you want to re-publish it?</p>
                    `,
                    contentColor: '#fff',
                    options: {
                        confirm: {
                            text: 'Yes, Re-publish it!',
                            background: '#0ea5e9',
                            onConfirm: function () {

                                // Ask schedule type
                                if ($scope.examData.schedule_type === 'scheduled') {

                                    // If scheduled → start time required
                                    if (!$scope.examData.start_time) {
                                        Toast.fire({
                                            type: 'error',
                                            title: 'Start Time Required',
                                            msg: 'Since the exam is scheduled, please set the start time.'
                                        });
                                        Toast.popover({ type: 'close' });
                                        return;
                                    }
                                }

                                proceedPublish(); // call main function
                                Toast.popover({ type: 'close' });
                            }
                        },
                        cancel: {
                            text: 'Cancel',
                            background: '#dc2626',
                            onCancel: () => Toast.popover({ type: 'close' })
                        }
                    }
                });

                return;
            }

            Toast.popover({
                type: 'confirm',
                title: 'Publish Exam?',
                titleColor: '#65deff',
                content: `
                    <i class="fa-solid fa-circle-info" style="font-size: 3rem; color: #65deff"></i><br><br>
                    <p>Are you sure you want to publish this exam? It will be available to candidates.</p>
                `,
                contentColor: '#fff',
                options: {
                    confirm: {
                        text: 'Yes, publish it!',
                        background: '#0e7490',
                        onConfirm: async function () {
                            await proceedPublish()
                            Toast.popover({ type: 'close' });
                        }
                    },
                    cancel: {
                        text: 'Cancel',
                        background: '#dc2626',
                        onCancel: function () {
                            Toast.popover({ type: 'close' });
                        }
                    }
                }
            });

        };

        // Check is start time passed
        function isPastStartTime(startTime) {
            const now = new Date();
            const examStart = new Date(startTime);
            return now >= examStart;
        }

        // Unpublish exam
        $scope.unpublishExam = function () {
            // if (isPastStartTime($scope.examData.start_time)) {
            //     Toast.fire({
            //         type: 'error',
            //         title: 'Cannot Unpublish',
            //         msg: 'Exam has already started. You can only SUDDEN CANCEL it.'
            //     });
            //     return;
            // }

            const now = new Date();
            const examStart = new Date($scope.examData.start_time);

            // If exam already started
            if (isPastStartTime($scope.examData.start_time)) {

                Toast.popover({
                    type: 'confirm',
                    title: 'Cancel Exam?',
                    titleColor: '#ca8a04',
                    content: `
                        <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; color: #dc2626"></i><br><br>
                        <p>This exam has already started.<br>
                        You cannot unpublish it now.<br>
                        Do you want to <b>Cancel</b> the exam?</p>
                    `,
                    contentColor: '#fff',
                    options: {
                        confirm: {
                            text: 'Yes, Cancel Now!',
                            background: '#dc2626',
                            onConfirm: async function () {
                                try {
                                    const response = await $http.post(
                                        window.baseUrl + '/API/cancel_exam/' + $scope.location.exam
                                    );

                                    if (response.data.status === 'success') {
                                        Toast.fire({
                                            type: 'warning',
                                            title: 'Exam Cancelled!',
                                            msg: 'The exam was suddenly stopped for all candidates.'
                                        });
                                        $scope.examData.status = 'canceled';
                                        $scope.$applyAsync();
                                    } else {
                                        Toast.fire({
                                            type: 'error',
                                            title: 'Failed!',
                                            msg: response.data.msg || 'Something went wrong.'
                                        });
                                    }
                                } catch (e) {
                                    Toast.fire({
                                        type: 'error',
                                        title: 'Server Error',
                                        msg: 'Check your API!'
                                    });
                                }

                                Toast.popover({ type: 'close' });
                            }
                        },
                        cancel: {
                            text: 'No, Keep Running',
                            background: '#0ea5e9',
                            onCancel: function () {
                                Toast.popover({ type: 'close' });
                            }
                        }
                    }
                });

                return;
            }

            // If exam NOT started
            Toast.popover({
                type: 'confirm',
                title: 'Unpublish Exam?',
                titleColor: '#ff6b6b',
                content: `
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #dc2626"></i><br><br>
                    <p>Are you sure you want to unpublish this exam? Candidates will no longer have access.</p>
                `,
                contentColor: '#fff',
                options: {
                    confirm: {
                        text: 'Yes, unpublish it!',
                        background: '#dc2626',
                        onConfirm: async function () {
                            try {
                                const response = await $http.post(
                                    window.baseUrl + '/API/unpublish_exam/' + $scope.location.exam
                                );

                                if (response.data.status === 'success') {
                                    Toast.fire({
                                        type: 'success',
                                        title: 'Exam Unpublished!',
                                        msg: 'Exam unpublished successfully!'
                                    });

                                    $scope.examData.status = 'draft';
                                    $scope.examData.published_at = null;
                                    $scope.step5Completed = false;
                                } else {
                                    Toast.fire({
                                        type: 'error',
                                        title: 'Failed!',
                                        msg: response.data.msg || 'Something went wrong.'
                                    });
                                }

                                $scope.$applyAsync()
                            } catch (e) {
                                Toast.fire({
                                    type: 'error',
                                    title: 'Server Error',
                                    msg: 'Check your API!'
                                });
                            }

                            Toast.popover({ type: 'close' });
                        }
                    },
                    cancel: {
                        text: 'Cancel',
                        background: '#0e7490',
                        onCancel: function () {
                            Toast.popover({ type: 'close' });
                        }
                    }
                }
            });
        };

        // Copy to clipboard
        $scope.copyToClipboard = function (inputElement) {
            try {
                if ($scope.examData.status === 'published' || $scope.examData.status === 'scheduled') {
                    inputElement.select();
                    inputElement.setSelectionRange(0, 99999);
                    document.execCommand("copy");
                    Toast.fire({ type: 'success', title: 'Success!', msg: 'Link copied to clipboard!' });
                } else {
                    Toast.fire({ type: 'error', title: 'Error', msg: 'Exam is not published.' });
                }
            } catch (e) {
                Toast.fire({ type: 'error', title: 'Error', msg: 'Failed to copy link.' });
                console.error(e);
            }
        };

        // Initialize on load
        $scope.init();
    }
]);