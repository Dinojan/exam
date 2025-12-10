app.controller('ExamController', [
    "$scope", "$http", "$compile", "$timeout", "window",
    function ($scope, $http, $compile, $timeout, window) {
        // Initialize scope variables
        $scope.exams = [];
        $scope.filteredExams = [];
        $scope.loading = true;
        $scope.error = null;
        $scope.searchQuery = '';
        $scope.currentFilter = 'all';
        $scope.activeExamMenu = null;
        $scope.theLoggedUser = window.theLoggedUser || {};

        // Load exams on controller initialization
        $scope.loadExams = function() {
            $scope.loading = true;
            $scope.error = null;
            
            $http.get(window.baseUrl + '/API/exam/all')
                .then(function(response) {
                    $scope.exams = response.data.exams || [];
                    $scope.filteredExams = [...$scope.exams];
                    $scope.loading = false;
                })
                .catch(function(error) {
                    $scope.error = error.data?.message || 'Failed to load exams';
                    $scope.loading = false;
                    console.error('Error loading exams:', error);
                });
        };

        // Filter exams based on status
        $scope.setFilter = function(filter) {
            $scope.currentFilter = filter;
            $scope.applyFilters();
        };

        // Apply both search and filter
        $scope.applyFilters = function() {
            let filtered = [...$scope.exams];
            
            // Apply status filter
            if ($scope.currentFilter !== 'all') {
                filtered = filtered.filter(function(exam) {
                    return exam.status === $scope.currentFilter;
                });
            }
            
            // Apply search filter
            if ($scope.searchQuery.trim()) {
                const query = $scope.searchQuery.toLowerCase();
                filtered = filtered.filter(function(exam) {
                    return exam.title?.toLowerCase().includes(query) ||
                           exam.code?.toLowerCase().includes(query) ||
                           exam.description?.toLowerCase().includes(query);
                });
            }
            
            $scope.filteredExams = filtered;
        };

        // Search exams
        $scope.searchExams = function() {
            $scope.applyFilters();
        };

        // Clear all filters and search
        $scope.clearFilters = function() {
            $scope.searchQuery = '';
            $scope.currentFilter = 'all';
            $scope.filteredExams = [...$scope.exams];
        };

        // Toggle exam dropdown menu
        $scope.toggleExamMenu = function(examId) {
            if ($scope.activeExamMenu === examId) {
                $scope.activeExamMenu = null;
            } else {
                $scope.activeExamMenu = examId;
            }
        };

        // Close dropdown when clicking outside
        $scope.closeDropdown = function() {
            $scope.activeExamMenu = null;
        };

        // Create new exam - navigate to create page
        $scope.createExam = function() {
            window.location.href = window.baseUrl + '/exam/create';
        };

        // Edit exam
        $scope.editExam = function(exam) {
            if (exam && exam.id) {
                window.location.href = window.baseUrl + '/edit/' + exam.id;
            } else {
                console.error('Cannot edit exam: Invalid exam object');
                showNotification('Cannot edit exam: Invalid data', 'error');
            }
        };

        // View exam details
        $scope.viewExamDetails = function(exam) {
            if (exam && exam.id) {
                window.location.href = window.baseUrl + '/view/' + exam.id;
            } else {
                console.error('Cannot view exam details: Invalid exam object');
                showNotification('Cannot view exam details', 'error');
            }
        };

        // Manage questions
        $scope.manageQuestions = function(exam) {
            if (exam && exam.id) {
                window.location.href = window.baseUrl + '/' + exam.id + '/questions';
            } else {
                console.error('Cannot manage questions: Invalid exam object');
                showNotification('Cannot manage questions', 'error');
            }
        };

        // View results
        $scope.viewResults = function(exam) {
            if (exam && exam.id) {
                window.location.href = window.baseUrl + '/' + exam.id + '/results';
            } else {
                console.error('Cannot view results: Invalid exam object');
                showNotification('Cannot view results', 'error');
            }
        };

        // Delete exam
        $scope.deleteExam = function(exam) {
            if (!exam || !exam.id) {
                showNotification('Cannot delete: Invalid exam data', 'error');
                return;
            }
            
            if (!confirm('Are you sure you want to delete "' + exam.title + '"? This action cannot be undone.')) {
                return;
            }
            
            $scope.loading = true;
            $http.delete('/api/exams/' + exam.id)
                .then(function(response) {
                    // Remove exam from list
                    $scope.exams = $scope.exams.filter(function(e) {
                        return e.id !== exam.id;
                    });
                    $scope.applyFilters();
                    
                    // Show success message
                    showNotification('"' + exam.title + '" deleted successfully', 'success');
                    $scope.loading = false;
                })
                .catch(function(error) {
                    $scope.error = error.data?.message || 'Failed to delete exam';
                    showNotification($scope.error, 'error');
                    $scope.loading = false;
                });
        };

        // Export exams
        $scope.exportExams = function() {
            console.log('Export exams');
            // Implement export functionality
            // window.location.href = window.baseUrl + '/export';
        };

        // Duplicate exam
        $scope.duplicateExam = function(exam) {
            if (!exam || !exam.id) {
                showNotification('Cannot duplicate: Invalid exam data', 'error');
                return;
            }
            
            if (confirm('Duplicate "' + exam.title + '"?')) {
                $scope.loading = true;
                $http.post('/api/exams/' + exam.id + '/duplicate')
                    .then(function(response) {
                        // Reload exams to show the duplicated one
                        $scope.loadExams();
                        showNotification('Exam duplicated successfully', 'success');
                    })
                    .catch(function(error) {
                        $scope.error = error.data?.message || 'Failed to duplicate exam';
                        showNotification($scope.error, 'error');
                        $scope.loading = false;
                    });
            }
        };

        // Show notification helper function
        function showNotification(message, type) {
            // You can implement a notification system here
            // For now, we'll use a simple alert
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ' + 
                                   (type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white');
            notification.textContent = message;
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            notification.style.transition = 'all 0.3s ease';
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Initialize
        $scope.$on('$viewContentLoaded', function() {
            $timeout(function() {
                $scope.loadExams();
            });
        });

        // Close dropdown when clicking outside (event listener)
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.relative')) {
                $scope.$apply(function() {
                    $scope.closeDropdown();
                });
            }
        });

        // Load exams initially
        $scope.loadExams();
    }
]);