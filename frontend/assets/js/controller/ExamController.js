app.controller('ExamController', [
    "$scope", "$http", "$timeout", "window",
    function ($scope, $http, $timeout, window) {

        // Initialize exam data
        $scope.examData = {
            title: '',
            code: '',
            duration: 120,
            total_marks: 100,
            passing_marks: 40,
            instructions: '',
            status: 'draft',
            sections: [],
            start_time: '',
            end_time: '',
            shuffle_questions: false,
            shuffle_options: false,
            show_results_immediately: false,
            allow_retake: false,
            max_attempts: 1,
            enable_proctoring: false,
            full_screen_mode: false,
            disable_copy_paste: false
        };

        // Steps configuration
        $scope.steps = [
            { number: 1, title: 'Basic Info', icon: 'fa-info-circle', active: true, completed: false },
            { number: 2, title: 'Questions', icon: 'fa-question-circle', active: false, completed: false },
            { number: 3, title: 'Settings', icon: 'fa-cog', active: false, completed: false },
            { number: 4, title: 'Review', icon: 'fa-check-circle', active: false, completed: false }
        ];

        $scope.currentStep = 1;
        $scope.totalSteps = $scope.steps.length;
        $scope.creatingExam = false;

        // Question management
        $scope.savedQuestions = [];
        $scope.currentQuestion = null;
        $scope.currentQuestionIndex = null;

        // Section management
        $scope.showAssignModal = false;
        $scope.assignSectionIndex = null;
        $scope.showSectionModal = false;
        $scope.editingSectionIndex = null;
        $scope.savedSections = [];
        $scope.currentSection = {};
        $scope.showSecondDescription = false;
        $scope.showRemoveSectionModal = false;
        $scope.showUnasignSectionModal = false;

        // Initialize controller
        $scope.init = function () {
            // $scope.startNewQuestion();
            $scope.handleExamCreation();
            // Add a default section
            // $scope.addNewSection();
        };

        $scope.handleExamCreation = function () {
            const exam = getParameterByName('exam');
            if (exam && exam !== undefined) {
                // $scope.creatingExam = false;
                $http({
                    url: 'API/exams/' + exam,
                    method: 'GET'
                }).then(function (response) {
                    console.log(response.data);
                    if (response.data.status === 'success') {
                        $scope.examData = response.data.exam;
                        $scope.examID = response.data.exam.id;

                        if (response.data.exam) {
                            $scope.currentStep = 2;
                            $scope.steps[0].completed = true;
                            $scope.steps[0].active = false;
                            $scope.steps[1].active = true;

                            if (response.data.exam) {
                                if (response.data.questions) {
                                    $scope.savedQuestions = response.data.questions;
                                }

                                if (response.data.sections) {
                                    $scope.savedSections = response.data.sections;
                                }
                            }
                        }
                    }
                }, function (error) {
                    const errorMsg = error.data?.message || 'Failed to fetch exam data';
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: errorMsg
                    });
                    console.error('API Error:', error);
                });
            }

        }

        // Navigation functions
        $scope.nextStep = function () {
            if ($scope.validateCurrentStep()) {
                $scope.steps[$scope.currentStep - 1].completed = true;
                $scope.steps[$scope.currentStep - 1].active = false;
                $scope.currentStep++;
                $scope.steps[$scope.currentStep - 1].active = true;
            }
        };

        $scope.previousStep = function () {
            $scope.steps[$scope.currentStep - 1].active = false;
            $scope.currentStep--;
            $scope.steps[$scope.currentStep - 1].active = true;
        };

        // Step validation
        $scope.validateCurrentStep = function () {
            switch ($scope.currentStep) {
                case 1:
                    $scope.basicInfoForm.$submitted = true;
                    if ($scope.basicInfoForm.$invalid) {
                        Toast.fire({
                            type: 'error',
                            title: 'Validation Error!',
                            msg: 'Please fill all required fields in Basic Information'
                        });
                        return false;
                    }
                    return true;

                case 2:
                    if ($scope.savedQuestions.length === 0) {
                        Toast.fire({
                            type: 'error',
                            title: 'Validation Error!',
                            msg: 'Please create and save at least one question'
                        });
                        return false;
                    }

                    // Check if all questions are saved
                    const unsavedQuestions = $scope.savedQuestions.filter(q => !q.isSaved);
                    if (unsavedQuestions.length > 0) {
                        Toast.fire({
                            type: 'error',
                            title: 'Validation Error!',
                            msg: 'Please save all questions before proceeding'
                        });
                        return false;
                    }
                    return true;

                case 3:
                    return true;

                default:
                    return true;
            }
        };

        $scope.saveBasicInfo = async function () {
            const formData = $('#basicInfoForm').serialize();
            $http({
                url: 'API/exams/basic_info',
                method: 'POST',
                data: formData
            }).then(function (response) {
                if (response.data.status === 'success') {
                    Toast.fire({
                        type: 'success',
                        title: 'Success!',
                        msg: 'Exam basic info saved successfully'
                    });
                    $scope.currentStep = 2;
                    $scope.examData = response.data.exam;
                    $scope.examID = response.data.exam.id;
                    $scope.steps[0].completed = true;
                    $scope.steps[0].active = false;
                    $scope.steps[1].active = true;
                } else {
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: response.data.message || 'Failed to save exam basic info'
                    });
                }
            }, function (error) {
                const errorMsg = error.data?.message || 'Failed to save exam basic info';
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: errorMsg
                });
                console.error('API Error:', error);
            })
        }

        // Question management
        $scope.startNewQuestion = function () {
            // Check if current question has unsaved changes
            if ($scope.currentQuestion && $scope.currentQuestion.text && !$scope.currentQuestion.isSaved) {
                if (!confirm('You have unsaved changes. Do you want to save before creating a new question?')) {
                    return;
                }
                $scope.saveCurrentQuestion();
            }

            $scope.currentQuestion = {
                text: '',
                image: null,
                options: [
                    { text: '', order: 1, op: 'A' },
                    { text: '', order: 2, op: 'B' },
                    { text: '', order: 3, op: 'C' },
                    { text: '', order: 4, op: 'D' }
                ],
                correct_answer: null,
                model_answer: '',
                marks: 1,
                isSaved: false,
                assignedSections: []
            };
            $scope.currentQuestionIndex = null;
        };


        // $scope.saveCurrentQuestion = function () {
        //     if (!$scope.currentQuestion.text) {
        //         Toast.fire({
        //             type: 'error',
        //             title: 'Validation Error!',
        //             msg: 'Please enter question text'
        //         });
        //         return;
        //     }

        //     // Validate multiple choice questions
        //     const validOptions = $scope.currentQuestion.options.filter(opt => opt.text || opt.image);
        //     if (validOptions.length < 2) {
        //         Toast.fire({
        //             type: 'error',
        //             title: 'Validation Error!',
        //             msg: 'Multiple choice questions must have at least 2 options'
        //         });
        //         return;
        //     }
        //     if ($scope.currentQuestion.correct_answer === null) {
        //         Toast.fire({
        //             type: 'error',
        //             title: 'Validation Error!',
        //             msg: 'Please select a correct answer'
        //         });
        //         return;
        //     }



        //     if ($scope.currentQuestionIndex === null) {
        //         // New question
        //         $scope.currentQuestion.isSaved = true;
        //         $scope.currentQuestion.id = 'q' + Date.now();
        //         $scope.currentQuestion.createdAt = new Date();
        //         $scope.savedQuestions.push(angular.copy($scope.currentQuestion));
        //         $scope.currentQuestionIndex = $scope.savedQuestions.length - 1;

        //         Toast.fire({
        //             type: 'success',
        //             title: 'Success!',
        //             msg: 'Question saved successfully'
        //         });
        //     } else {
        //         // Update existing question
        //         $scope.currentQuestion.isSaved = true;
        //         $scope.currentQuestion.updatedAt = new Date();
        //         $scope.savedQuestions[$scope.currentQuestionIndex] = angular.copy($scope.currentQuestion);

        //         Toast.fire({
        //             type: 'success',
        //             title: 'Success!',
        //             msg: 'Question updated successfully'
        //         });
        //     }
        // };

        $scope.saveCurrentQuestion = function () {
            const formId = 'questionForm' + ($scope.currentQuestion.id || 'New');
            const formElement = document.getElementById(formId);
            if (!formElement) return;

            // Validation
            if (!$scope.currentQuestion.question) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'Please enter question text' });
                return;
            }

            const validOptions = $scope.currentQuestion.options.filter(opt => opt.text || opt.image);
            if (validOptions.length < 2) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'At least 2 options are required' });
                return;
            }

            if ($scope.currentQuestion.answer === null || $scope.currentQuestion.answer === undefined) {
                Toast.fire({ type: 'error', title: 'Validation Error!', msg: 'Please select a correct answer' });
                return;
            }

            // Use FormData instead of serialize
            const formData = new FormData(formElement);

            // Add option images
            $scope.currentQuestion.options.forEach(option => {
                if (option.file) {
                    formData.append(option.op + 'img', option.file); // use name attribute
                }
            });

            // Add main question image if exists
            if ($scope.currentQuestion.imageFile) {
                formData.append('questionImage', $scope.currentQuestion.imageFile);
            }

            // API URL
            const apiUrl = $scope.currentQuestion.id ? 'API/questions/edit_question/' + $scope.currentQuestion.id : 'API/questions/add_question';

            $http.post(apiUrl, formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined } // important for file upload
            }).then(function (response) {
                if (response.data.status === 'success') {
                    Toast.fire({ type: 'success', title: 'Success!', msg: 'Question saved successfully' });

                    const updated = response.data.question;

                    // Update currentQuestion
                    $scope.currentQuestion = updated;

                    // Handle new question ID
                    if (updated.id) {
                        $scope.currentQuestion.id = updated.id;
                        $scope.currentQuestion.isSaved = true;
                    }

                    // If editing existing → replace in savedQuestions
                    if ($scope.currentQuestionIndex !== null && $scope.currentQuestionIndex !== undefined) {
                        $scope.savedQuestions[$scope.currentQuestionIndex] = angular.copy(updated);
                        $scope.savedQuestions[$scope.currentQuestionIndex].updatedAt = new Date();
                    }

                    // If adding new → push to savedQuestions
                    else {
                        updated.createdAt = new Date();
                        $scope.savedQuestions.push(updated);
                        $scope.currentQuestionIndex = $scope.savedQuestions.length - 1;
                    }
                } else {
                    Toast.fire({ type: 'error', title: 'Error!', msg: response.data.msg });
                }
            }).catch(function (error) {
                Toast.fire({ type: 'error', title: 'Error!', msg: 'Something went wrong' });
                console.error(error);
            });
        };



        $scope.loadQuestionForEditing = function (index) {
            // Check if current question has unsaved changes
            if ($scope.currentQuestion && $scope.currentQuestion.text && !$scope.currentQuestion.isSaved) {
                if (!confirm('You have unsaved changes. Do you want to save before switching questions?')) {
                    return;
                }
                $scope.saveCurrentQuestion();
            }

            $scope.currentQuestion = angular.copy($scope.savedQuestions[index]);
            $scope.currentQuestionIndex = index;
        };

        $scope.deleteCurrentQuestion = function () {
            if ($scope.currentQuestionIndex === null) return;

            Toast.popover({
                type: 'confirm',
                title: 'Delete Question',
                titleColor: '#fb0',
                content: '<i class="fa-regular fa-circle-question" style="font-size: 4rem; color: #fb0"></i><br><br>Are you sure you want to delete this question? This action cannot be undone.',
                contentColor: '#fb0',
                backgroundColor: '#fff3',
                closeButtonColor: '#dc2626',
                options: {
                    confirm: {
                        text: 'Yes, Delete!',
                        background: '#dc2626',
                        onConfirm: function () {
                            $http({
                                url: 'API/questions/delete_question/' + $scope.currentQuestion.id,
                                method: 'DELETE'
                            }).then(function (response) {
                                if (response.data.status === 'success') {
                                    const question = $scope.savedQuestions[$scope.currentQuestionIndex];
                                    if (question.assignedSections && question.assignedSections.length > 0) {
                                        question.assignedSections.forEach(sectionIndex => {
                                            $scope.savedSections[sectionIndex].assignedQuestions =
                                                ($scope.savedSections[sectionIndex].assignedQuestions || 0) - 1;
                                        });
                                    }

                                    $scope.savedQuestions.splice($scope.currentQuestionIndex, 1);
                                    $scope.startNewQuestion();
                                    Toast.fire({
                                        type: 'success',
                                        title: 'Success!',
                                        msg: 'Question deleted successfully'
                                    });
                                }
                            })
                        }
                    },
                    cancel: {
                        text: 'No, Cancel',
                        background: '#0e7490',
                        onConfirm: function () {
                            Toast.popover({ type: 'close' });
                        }
                    }
                }
            })
        };

        $scope.previousQuestion = function () {
            if ($scope.currentQuestionIndex > 0) {
                $scope.loadQuestionForEditing($scope.currentQuestionIndex - 1);
            }
        };

        $scope.nextQuestion = function () {
            if ($scope.currentQuestionIndex < $scope.savedQuestions.length - 1) {
                $scope.loadQuestionForEditing($scope.currentQuestionIndex + 1);
            }
        };

        // Section management
        $scope.addNewSection = function () {
            if (!$scope.savedSections) {
                $scope.savedSections = [];
            }
            $scope.currentSection = {
                title: 'Section ' + ($scope.savedSections.length + 1),
                description: '',
                secondDescription: '',
                question_count: 2,
                assignedQuestions: 0,
                id: '',
                examID: $scope.examID
            };
            $scope.editingSectionIndex = null;
            $scope.showSectionModal = true;
        };

        $scope.editSection = function (index) {
            $scope.currentSection = angular.copy($scope.savedSections[index]);
            $scope.editingSectionIndex = index;
            $scope.showSectionModal = true;
            if ($scope.currentSection.secondDescription) {
                $scope.showSecondDescription = true;
            }
        };

        $scope.addSecondDescription = function () {
            $scope.showSecondDescription = true;
        };

        $scope.saveSection = function () {
            if (!$scope.currentSection.title) {
                Toast.fire({
                    type: 'error',
                    title: 'Validation Error!',
                    msg: 'Please enter the section title'
                });
                return;
            }

            if (!$scope.currentSection.question_count) {
                Toast.fire({
                    type: 'error',
                    title: 'Validation Error!',
                    msg: 'Please enter the number of questions'
                });
                return;
            }

            const endpoint =  $scope.currentSection.id ? 'API/sections/edit/' + $scope.currentSection.id : 'API/sections/add';
            console.log(endpoint);
            $http({
                url: endpoint,
                method: 'POST',
                data: $('#section_form').serialize()
            }).then(function (response) {
                if (response.data.status === 'success') {
                    $scope.currentSection = response.data.section;
                    if ($scope.editingSectionIndex === null) {
                        $scope.savedSections.push(angular.copy(response.data.section));
                        Toast.fire({
                            type: 'success',
                            title: 'Success!',
                            msg: 'Section created successfully'
                        });
                    } else {
                        // Update existing section
                        $scope.savedSections[$scope.editingSectionIndex] = angular.copy(response.data.section);
                        Toast.fire({
                            type: 'success',
                            title: 'Success!',
                            msg: 'Section updated successfully'
                        });
                    }

                    $scope.currentSection = {};
                    $scope.editingSectionIndex = null;
                }
            })
            $scope.showSectionModal = false;
            $scope.showSecondDescription = false;
            $scope.updateSectionQuestionCounts();
        };

        $scope.removeSection = function (sectionID) {
            if ($scope.savedSections.length <= 1) {
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: 'Cannot delete the last section'
                });
                return;
            }

            Toast.popover({
                type: 'confirm',
                title: 'Remove Section',
                titleColor: '#fb0',
                content: '<i class="fa-regular fa-circle-question" style="font-size: 4rem; color: #fb0"></i><br><br>Are you sure you want to delete this section? Assigned questions will be unassigned.',
                contentColor: '#fb0',
                backgroundColor: '#fff3',
                closeButtonColor: '#dc2626',
                options: {
                    confirm: {
                        text: 'Yes, Remove this section!',
                        background: '#dc2626',
                        onConfirm: function () {
                            $http({
                                url: 'API/sections/delete/' + sectionID,
                                method: 'DELETE'
                            }).then(function (response) {
                                if (response.data.status === 'success') {

                                    // Remove section from assignedSections in questions
                                    $scope.savedQuestions.forEach(question => {
                                        if (Array.isArray(question.assignedSections)) {
                                            question.assignedSections = question.assignedSections.filter(id => id !== sectionID);
                                        }
                                    });

                                    // Remove section from savedSections
                                    $scope.savedSections = $scope.savedSections.filter(s => s.id !== sectionID);

                                    $scope.updateSectionQuestionCounts();

                                    Toast.fire({
                                        type: 'success',
                                        title: 'Success!',
                                        msg: 'Section deleted successfully'
                                    });
                                }
                            });
                        }
                    },
                    cancel: {
                        text: 'No, Cancel',
                        background: '#0e7490',
                        onConfirm: function () {
                            Toast.popover({ type: 'close' });
                        }
                    }
                }
            });
        };

        $scope.updateSectionQuestionCounts = function () {
            console.log($scope.savedSections);
            $scope.savedSections.forEach(section => {
                section.assignedQuestions = $scope.savedQuestions.filter(q =>
                    q.assignedSections && q.assignedSections.includes(section.id)
                ).length;
            });
            console.log($scope.savedSections);
        };

        // Open Assign Modal
        $scope.assignToSection = function () {
            if (!$scope.currentQuestion.isSaved) {
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: 'Please save the question before assigning to a section'
                });
                return;
            }

            if ($scope.savedSections.length === 0) {
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: 'Please create at least one section first'
                });
                return;
            }

            // 🔥 FIXED
            $scope.currentQuestionId = $scope.currentQuestion.id;
            $scope.assignSectionId = null;

            $scope.showAssignModal = true;
        };

        // Confirm Assignment
        $scope.confirmAssignToSection = function () {

            const sectionId = parseInt($scope.assignSectionId);
            const questionId = parseInt($scope.currentQuestionId);

            const section = $scope.savedSections.find(s => s.id === sectionId);
            const question = $scope.savedQuestions.find(q => q.id === questionId);

            // Section full?
            if (section.assignedQuestions >= section.question_count) {
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: 'This section reached its limit (' + section.question_count + ' questions)'
                });
                return;
            }

            // Ensure array exists
            if (!Array.isArray(question.assignedSections)) {
                question.assignedSections = [];
            }

            // Already assigned check
            if (question.assignedSections.includes(sectionId)) {
                Toast.fire({
                    type: 'info',
                    title: 'Info',
                    msg: 'Question already assigned to this section'
                });
                $scope.showAssignModal = false;
                return;
            }

            // API CALL
            $http({
                url: 'API/questions/assign_to_section/' + questionId,
                method: 'POST',
                data: $('#assign_question_to_section_form').serialize()
            }).then(function (response) {

                if (response.data.status === 'success') {

                    question.assignedSections.push(sectionId);

                    const qIndex = $scope.savedQuestions.findIndex(q => q.id === questionId);
                    $scope.savedQuestions[qIndex] = angular.copy(question);

                    $scope.updateSectionQuestionCounts();

                    Toast.fire({
                        type: 'success',
                        title: 'Success!',
                        msg: 'Question assigned successfully'
                    });

                    $scope.showAssignModal = false;

                } else {
                    Toast.fire({
                        type: 'error',
                        title: 'Error',
                        msg: 'Failed to assign question'
                    });
                }

            }, function () {
                Toast.fire({
                    type: 'error',
                    title: 'Error',
                    msg: 'Failed to assign question'
                });
            });

        };

        // Open Unssign Modal
        $scope.openUnassignSectionModal = function (questionID) {
            const question = $scope.savedQuestions.find(q => q.id === questionID);

            if (!question) {
                console.error("Question not found");
                return;
            }

            // Ensure assignedSections exists
            if (!Array.isArray(question.assignedSections)) {
                question.assignedSections = [];
            }

            // Filter only those sections assigned to this question
            $scope.selectedQuestionAssignedSections = $scope.savedSections
                .filter(section => question.assignedSections.includes(section.id));

            // Save question ID
            $scope.unassignQuestion = questionID;

            // Open UNASSIGN modal (not Assign modal)
            $scope.showUnasignSectionModal = true;

            // console.log("Unassign modal opened for:", question);
            console.log($scope.selectedQuestionAssignedSections);
        };

        $scope.confirmUnassignSection = function () {

            const questionId = $scope.unassignQuestion;

            // Get the question
            const question = $scope.savedQuestions.find(q => q.id === questionId);
            if (!question) {
                Toast.fire({ type: 'error', title: 'Error', msg: 'Question not found' });
                return;
            }

            // Ensure list exists
            if (!Array.isArray(question.assignedSections) || question.assignedSections.length === 0) {
                Toast.fire({ type: 'error', title: 'Error', msg: 'This question is not assigned to any section' });
                return;
            }

            // Selected section ID to unassign
            const sectionId = parseInt($scope.unassignSectionId);

            if (!sectionId) {
                Toast.fire({ type: 'error', title: 'Error', msg: 'Please select a section' });
                return;
            }

            // Check if assigned
            if (!question.assignedSections.includes(sectionId)) {
                Toast.fire({ type: 'info', title: 'Info', msg: 'This question is not assigned to selected section' });
                return;
            }

            $http({
                url: 'API/questions/unassign_section/' + questionId,
                method: 'POST',
                data: $('#remove_question_to_section_form').serialize()
            }).then(function (response) {

                if (response.data.status === 'success') {
                    // Remove sectionId from assignedSections array
                    question.assignedSections = question.assignedSections.filter(id => id !== sectionId);

                    // Update savedQuestions UI list
                    const qIndex = $scope.savedQuestions.findIndex(q => q.id === questionId);
                    $scope.savedQuestions[qIndex] = angular.copy(question);

                    // Update section counts
                    $scope.updateSectionQuestionCounts();

                    Toast.fire({
                        type: 'success',
                        title: 'Success',
                        msg: 'Section unassigned successfully'
                    });

                    $scope.showUnassignModal = false;

                } else {
                    Toast.fire({ type: 'error', title: 'Error', msg: 'Failed to unassign section' });
                }

                $scope.showUnasignSectionModal = false;

            }, function () {
                Toast.fire({ type: 'error', title: 'Error', msg: 'Failed to unassign section' });
            });
        };

        $scope.getAssignedSectionNames = function (question) {
            if (!question.assignedSections || question.assignedSections.length === 0) {
                return 'None';
            }

            return question.assignedSections
                .map(sectionId => {
                    const section = $scope.savedSections.find(s => s.id == sectionId);
                    return section ? section.title : 'Unknown';
                })
                .join(', ');
        };


        // Options management
        $scope.addOption = function (question) {
            if (!question.options) {
                question.options = [];
            }
            // Get the next letter based on current length
            let nextChar = String.fromCharCode(65 + question.options.length); // 65 = 'A'

            question.options.push({
                text: '',
                order: question.options.length + 1,
                op: nextChar
            });
        };


        $scope.removeOption = function (question, optionIndex) {
            if (question.options.length > 2) {
                question.options.splice(optionIndex, 1);
                // Update correct answer if it was the removed option
                if (question.correct_answer === optionIndex) {
                    question.correct_answer = null;
                } else if (question.correct_answer > optionIndex) {
                    question.correct_answer--;
                }
                $scope.reorderOptions(question);
            }
        };

        $scope.reorderOptions = function (question) {
            question.options.forEach((option, index) => {
                option.order = index + 1;
            });
        };

        $scope.onQuestionTypeChange = function () {
            // Reset options when question type changes
            if (!$scope.currentQuestion.options || $scope.currentQuestion.options.length === 0) {
                $scope.currentQuestion.options = [
                    { text: '', order: 1, op: 'A' },
                    { text: '', order: 2, op: 'B' },
                    { text: '', order: 3, op: 'C' },
                    { text: '', order: 4, op: 'D' }
                ];
            }
            $scope.currentQuestion.correct_answer = null;
        };

        // Image handling
        $scope.onQuestionImageSelect = function (files) {
            if (files && files.length) {
                const file = files[0];
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        $scope.$apply(function () {
                            $scope.currentQuestion.image = e.target.result;
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: 'Please select a valid image file'
                    });
                }
            }
        };

        $scope.uploadOptionImage = function (option) {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.name = option.op + 'img'
            fileInput.onchange = function (e) {
                const file = e.target.files[0];
                if (file && file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        $scope.$apply(function () {
                            option.file = file;                        // ✅ actual file for API
                            option.image = URL.createObjectURL(file);  // preview
                            option.text = '';
                        });
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
        };

        $scope.removeOptionImage = function (option) {
            option.image = null;
        };

        // Calculations and summaries
        $scope.getTotalMarks = function () {
            return $scope.savedQuestions.reduce((total, question) => {
                return total + (question.marks || 0);
            }, 0);
        };

        $scope.getQuestionTypesSummary = function () {
            const typeCounts = {};
            $scope.savedQuestions.forEach(question => {
                typeCounts[question.type] = (typeCounts[question.type] || 0) + 1;
            });
            return Object.keys(typeCounts).map(type => {
                return `${typeCounts[type]} ${type.replace('_', ' ')}`;
            }).join(', ');
        };

        // Create exam
        $scope.createExam = function () {
            $scope.creatingExam = true;

            // Prepare data for API
            const submitData = {
                ...$scope.examData,
                questions: $scope.savedQuestions,
                total_questions: $scope.savedQuestions.length,
                total_marks: $scope.getTotalMarks()
            };

            $http({
                url: 'API/exams',
                method: 'POST',
                data: submitData
            }).then(
                function (response) {
                    $scope.creatingExam = false;

                    if (response.data && response.data.success) {
                        Toast.fire({
                            type: 'success',
                            title: 'Success!',
                            msg: 'Exam created successfully'
                        });

                        // Redirect to exam management after 2 seconds
                        $timeout(() => {
                            window.location.href = 'exam_management';
                        }, 2000);
                    } else {
                        Toast.fire({
                            type: 'error',
                            title: 'Error!',
                            msg: response.data.message || 'Failed to create exam'
                        });
                    }
                },
                function (error) {
                    $scope.creatingExam = false;
                    const errorMsg = error.data?.message || 'Failed to create exam';
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: errorMsg
                    });
                    console.error('API Error:', error);
                }
            );
        };

        // Close when clicking outside modal
        $scope.closeModalFromOutside = function (event, id, variable, relatedValiales = []) {
            if (event.target.id === id) {
                $scope[variable] = false;
                for (let i = 0; i < relatedValiales.length; i++) {
                    $scope[relatedValiales[i]] = false;
                }
            }
        };

        // Initialize the controller
        $scope.init();
    }
]);