app.controller('MyResultsController', [
    "$scope", "$http", "$timeout", "$filter",
    function ($scope, $http, $timeout, $filter) {
        // Initialize scope variables
        $scope.loading = true;
        $scope.error = null;
        $scope.currentFilter = 'all';
        $scope.results = [];
        $scope.filteredResults = [];
        $scope.stats = {
            totalExams: 0,
            averageScore: 0,
            passRate: 0,
            highestScore: 0,
        };
        $scope.theLoggedUser = {};

        function session() {
            return $http.get(`${window.baseUrl}/API/session`).then(function (response) {
                if (response.data.status === 'success') {
                    const data = response.data.user;

                    $scope.theLoggedUser.id = data.user;
                    $scope.theLoggedUser.username = data.username;
                    $scope.theLoggedUser.role = data.role;
                    $scope.theLoggedUser.rolename = data.role_name;
                    $scope.theLoggedUser.email = data.email;
                    $scope.theLoggedUser.permissions = data.permissions;
                }
            });
        }

        session().then(() => {
            $scope.init();
        });


        // Initialize controller
        $scope.init = function () {
            $scope.loadResults();
        };

        // Calculate statistics
        $scope.calculateStats = function (results) {
            if (!results || results.length === 0) {
                $scope.stats = {
                    totalExams: 0,
                    averageScore: 0,
                    passRate: 0,
                    highestScore: 0,
                };
                return;
            }

            const stats = {
                totalExams: results.length,
                totalScore: 0,
                passedExams: 0,
                highestScore: 0,
                subjectScores: {}
            };

            results.forEach(result => {
                stats.totalScore += result.percentage || 0;
                if (result.is_passed !== false) {
                    stats.passedExams++;
                }
                if (result.percentage > stats.highestScore) {
                    stats.highestScore = result.percentage;
                }

                // Track subject performance (extract from exam title)
                const subject = result.exam_title?.split(' ')[0] || 'Unknown';
                if (!stats.subjectScores[subject]) {
                    stats.subjectScores[subject] = { total: 0, count: 0 };
                }
                stats.subjectScores[subject].total += result.percentage;
                stats.subjectScores[subject].count++;
            });

            $scope.stats = {
                totalExams: stats.totalExams,
                averageScore: Math.round(stats.totalScore / stats.totalExams),
                passRate: Math.round((stats.passedExams / stats.totalExams) * 100),
                highestScore: stats.highestScore
            };
        };

        // Load results from API
        $scope.loadResults = function () {
            $scope.loading = true;
            $scope.error = null;

            // Determine endpoint based on user role
            const endpoint = ($scope.theLoggedUser.role === '5' || $scope.theLoggedUser.role === 5)
                ? 'results/lecturer/' + $scope.theLoggedUser.id
                : 'results/student/' + $scope.theLoggedUser.id;

            $http.get(window.baseUrl + '/API/' + endpoint).then(function (response) {
                if (response.data.status === 'success') {
                    $scope.results = response.data.results;
                    $scope.calculateStats($scope.results);
                    $scope.filterResults();
                } else {
                    throw new Error(response.data.msg || 'Failed to load results');
                }
            }).catch(function (error) {
                console.error('Error loading results:', error);
                $scope.error = error.message || 'Unable to connect to server.';

            }).finally(function () {
                $scope.loading = false;
            });
        };

        // Set filter
        $scope.setFilter = function (filter) {
            $scope.currentFilter = filter;
            $scope.filterResults();
        };

        // Filter results based on current filter
        $scope.filterResults = function () {
            if (!$scope.results || $scope.results.length === 0) {
                $scope.filteredResults = [];
                return;
            }

            switch ($scope.currentFilter) {
                case 'passed':
                    $scope.filteredResults = $scope.results.filter(r =>
                        ($scope.theLoggedUser.role == '2' || $scope.theLoggedUser.role == 2)
                            ? r.pass_rate >= 70
                            : r.is_passed !== false
                    );
                    break;
                case 'failed':
                    $scope.filteredResults = $scope.results.filter(r =>
                        ($scope.theLoggedUser.role == '2' || $scope.theLoggedUser.role == 2)
                            ? r.pass_rate < 70
                            : r.is_passed === false
                    );
                    break;
                case 'recent':
                    // Sort by date descending and take first 5
                    $scope.filteredResults = [...$scope.results]
                        .sort((a, b) => new Date(b.completed_date || b.schedule_date) - new Date(a.completed_date || a.schedule_date))
                        .slice(0, 5);
                    break;
                case 'top':
                    // Sort by score descending
                    $scope.filteredResults = [...$scope.results].sort((a, b) =>
                        ($scope.theLoggedUser.role == '2' || $scope.theLoggedUser.role == 2)
                            ? (b.average_score || 0) - (a.average_score || 0)
                            : (b.percentage || 0) - (a.percentage || 0)
                    ).slice(0, 5);
                    break;
                case 'all':
                default:
                    $scope.filteredResults = $scope.results;
                    break;
            }
        };

        // Clear filters
        $scope.clearFilters = function () {
            $scope.currentFilter = 'all';
            $scope.filterResults();
        };

        // View detailed results
        $scope.viewDetailedResults = function (resultId) {
            window.location.href = window.baseUrl + '/exam/results/detail/' + resultId;
        };

        // Review exam answers
        $scope.reviewExam = function (examId) {
            window.location.href = window.baseUrl + '/exam/review/' + examId;
        };

        // Retake exam
        $scope.retakeExam = function (examId) {
            if (confirm('Are you sure you want to retake this exam? Your previous score will be archived.')) {
                window.location.href = window.baseUrl + '/exam/attempt/' + examId;
            }
        };

        // Export results (for lecturers)
        $scope.exportResults = function () {
            // In a real app, this would trigger a download
            alert('Export functionality would download a CSV file with all results.');
        };

        // Request more exams (for students)
        $scope.requestExams = function () {
            alert('Contact your instructor to request additional exams.');
        };

        // Get days remaining (for student view)
        $scope.getDaysRemaining = function (dateString) {
            if (!dateString) return 'N/A';
            const now = new Date();
            const date = new Date(dateString);
            const diffTime = date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) return 'Expired';
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            return diffDays + ' days';
        };

        // Get time until start (for upcoming exams)
        $scope.getTimeUntilStart = function (dateString) {
            if (!dateString) return 'N/A';
            const now = new Date();
            const date = new Date(dateString);
            const diffMs = date - now;

            if (diffMs < 0) return 'Started';

            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffDays > 0) return diffDays + 'd ' + diffHours + 'h';
            if (diffHours > 0) return diffHours + 'h ' + diffMins + 'm';
            return diffMins + ' minutes';
        };

        $scope.getPerformanceColor = function (passRate) {
            if (passRate <= 34) return 'text-red-500';       // Very Poor
            if (passRate <= 49) return 'text-orange-500';    // Poor
            if (passRate <= 64) return 'text-yellow-400';    // Average
            if (passRate <= 74) return 'text-blue-400';      // Good
            return 'text-green-400';                         // Excellent
        };

        $scope.getPerformanceBackground = function (passRate) {
            if (passRate <= 34) return 'bg-red-500';       // Very Poor
            if (passRate <= 49) return 'bg-orange-500';    // Poor
            if (passRate <= 64) return 'bg-yellow-400';    // Average
            if (passRate <= 74) return 'bg-blue-400';      // Good
            return 'bg-green-400';                         // Excellent
        };

        $scope.getPerformanceIcon = function (passRate) {
            if (passRate <= 34) return 'fa-times-circle';
            if (passRate <= 49) return 'fa-exclamation-circle';
            if (passRate <= 64) return 'fa-minus-circle';
            if (passRate <= 74) return 'fa-check-circle';
            return 'fa-star';
        };

        $scope.getPerformanceLabel = function (passRate) {
            if (passRate <= 34) return 'Very Poor';
            if (passRate <= 49) return 'Poor';
            if (passRate <= 64) return 'Average';
            if (passRate <= 74) return 'Good';
            return 'Excellent';
        };

    }
]);