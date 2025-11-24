app.controller('ExamController', [
    "$scope", "$http", "$timeout",
    function ($scope, $http, $timeout) {

        // Initialize exam data
        $scope.examData = {
            title: '',
            code: '',
            type: 'multiple_choice',
            category_id: '',
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
            { number: 2, title: 'Sections', icon: 'fa-layer-group', active: false, completed: false },
            { number: 3, title: 'Settings', icon: 'fa-cog', active: false, completed: false },
            { number: 4, title: 'Review', icon: 'fa-check-circle', active: false, completed: false }
        ];

        $scope.currentStep = 1;
        $scope.categories = [];
        $scope.creatingExam = false;

        // Initialize controller
        $scope.init = function () {
            // $scope.loadCategories();
            $scope.addNewSection(); // Add first section by default
        };

        // Load categories from API
        // $scope.loadCategories = function () {
        //     $http({
        //         url: 'API/exam_categories',
        //         method: 'GET'
        //     }).then(
        //         function (response) {
        //             if (response.data && response.data.success) {
        //                 $scope.categories = response.data.data || [];
        //             } else {
        //                 $scope.categories = response.data || [];
        //             }
        //         },
        //         function (error) {
        //             console.error('Failed to load categories:', error);
        //             Toast.fire({
        //                 type: 'error',
        //                 title: 'Error!',
        //                 msg: 'Failed to load exam categories'
        //             });
        //         }
        //     );
        // };

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
                    if ($scope.examData.sections.length === 0) {
                        Toast.fire({
                            type: 'error',
                            title: 'Validation Error!',
                            msg: 'Please add at least one section'
                        });
                        return false;
                    }

                    // Validate each section
                    for (let i = 0; i < $scope.examData.sections.length; i++) {
                        const section = $scope.examData.sections[i];
                        if (!section.title || !section.order || !section.question_count || !section.marks_per_question) {
                            Toast.fire({
                                type: 'error',
                                title: 'Validation Error!',
                                msg: `Please fill all required fields in Section ${i + 1}`
                            });
                            return false;
                        }
                    }
                    return true;

                case 3:
                    // Settings step is always valid
                    return true;

                default:
                    return true;
            }
        };

        // Section management
        $scope.addNewSection = function () {
            const newSection = {
                title: '',
                description: '',
                order: $scope.examData.sections.length + 1,
                question_count: 10,
                marks_per_question: 1,
                negative_marking: 0,
                question_type: 'multiple_choice',
                time_limit: null
            };
            $scope.examData.sections.push(newSection);
        };

        $scope.removeSection = function (index) {
            if ($scope.examData.sections.length > 1) {
                $scope.examData.sections.splice(index, 1);
                // Reorder sections
                $scope.examData.sections.forEach((section, idx) => {
                    section.order = idx + 1;
                });
            }
        };

        // Calculations
        $scope.getTotalQuestions = function () {
            return $scope.examData.sections.reduce((total, section) => total + section.question_count, 0);
        };

        $scope.getTotalSectionMarks = function () {
            return $scope.examData.sections.reduce((total, section) => {
                return total + (section.question_count * section.marks_per_question);
            }, 0);
        };

        // Create exam
        $scope.createExam = function () {
            $scope.creatingExam = true;

            $http({
                url: 'API/exams',
                method: 'POST',
                data: $scope.examData
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

        // Initialize the controller
        $scope.init();
    }
]);