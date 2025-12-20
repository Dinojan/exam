app.controller('ResultsController', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    // Initial state
    $scope.loading = true;
    $scope.error = null;
    $scope.students = [];
    $scope.exams = [];
    $scope.results = [];
    $scope.filteredResults = [];
    $scope.currentFilter = 'all';
    $scope.selectedStudent = null;
    $scope.selectedExam = '';
    $scope.timeFilter = 'all';
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalPages = 1;
    $scope.dropdownOpen = false;
    $scope.examList = [];
    $scope.timeFilterLabel = 'All Time';
    $scope.selectedExamTitle = 'All Exams';
    $scope.stats = {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        activeStudents: 0,
        averageTime: '00:00',
        highestScore: 0
    };


    // Initialize controller
    $scope.init = function () {
        $scope.loadResults();
        $scope.loadExamList();
    };

    $scope.setTimeFilter = function (value, label) {
        $scope.timeFilter = value;
        $scope.timeFilterLabel = label;
        $scope.timeDropdownOpen = false;
        $scope.loadResults();
    };

    $scope.setExam = function (id, title) {
        $scope.selectedExam = id;
        $scope.selectedExamTitle = title;
        $scope.examDropdownOpen = false;
        $scope.loadResults();
    };

    // Load results from server
    $scope.loadResults = function () {
        $scope.loading = true;
        $scope.error = null;

        // Prepare API parameters
        const params = {
            student_id: $scope.selectedStudent ? $scope.selectedStudent.id : 'all',
            exam_id: $scope.selectedExam || 'all',
            time_filter: $scope.timeFilter || 'all',
            filter: $scope.currentFilter
        };

        $http.get(window.baseUrl + '/API/results/admin', { params })
            .then(function (response) {
                if (response.data.status === 'success') {
                    $scope.students = response.data.students;
                    $scope.exams = response.data.exams;
                } else {
                    Toast.fire({
                        type: 'error',
                        title: 'Loading Error',
                        msg: 'Failed to load results. Please try again.'
                    })
                }
            })
        // Simulate API call with timeout
        $timeout(function () {
            try {
                // Generate dummy data based on filters
                $scope.generateData(params);
                $scope.calculateStats();
                $scope.applyFilters();
                $scope.calculatePagination();
                $scope.loading = false;
            } catch (err) {
                $scope.error = 'Failed to load results. Please try again.';
                $scope.loading = false;
                console.error('Error loading results:', err);
            }
        }, 1000);
    };

    // Load exam list for filter dropdown
    $scope.loadExamList = function () {
        // Simulate API call
        $timeout(function () {
            $scope.examList = [
                { id: 'EXM001', title: 'AngularJS Fundamentals' },
                { id: 'EXM002', title: 'JavaScript Advanced Concepts' },
                { id: 'EXM003', title: 'Web Development Basics' },
                { id: 'EXM004', title: 'Database Design' },
                { id: 'EXM005', title: 'PHP Programming' }
            ];
        }, 500);
    };

    // Generate dummy data based on filters
    $scope.generateData = function (params) {
        $scope.results = [];
        const students = $scope.students;
        const exams = $scope.exams;
        console.log(students);
        console.log(exams);
        const numResults = students.find(s => s.id == params.student_id).exams.length;
        for (let i = 0; i < numResults; i++) {
            const student = students.find(s => s.id == params.student_id)
            const exam = exams.find(e => e.id === params.exam_id)
               
            const percentage = Math.floor(Math.random() * 40) + 40; // 40-80%
            const totalMarks = 100;
            const score = Math.round((percentage / 100) * totalMarks);
            const timeTaken = `${Math.floor(Math.random() * 30) + 30}:${Math.random() > 0.5 ? '15' : '45'}`;
            const timePercentage = Math.floor(Math.random() * 40) + 60; // 60-100%

            const result = {
                id: i + 1,
                student_id: student.id,
                student_name: student.name,
                exam_id: exam.id,
                exam_title: exam.title,
                exam_code: exam.code,
                score: score,
                total_marks: totalMarks,
                percentage: percentage,
                passing_percentage: exam.passing_percentage,
                correct_answers: Math.floor(Math.random() * 8) + 12, // 12-20
                incorrect_answers: Math.floor(Math.random() * 8), // 0-8
                skipped_questions: Math.floor(Math.random() * 3), // 0-3
                total_questions: 20,
                accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
                time_taken: timeTaken,
                time_taken_percentage: timePercentage,
                completed_date: generateRandomDate(),
                allow_retake: Math.random() > 0.5,
                status: percentage >= exam.passing_percentage ? 'passed' : 'failed'
            };

            // Apply time filter
            if (params.time_filter !== 'all') {
                const resultDate = new Date(result.completed_date);
                const now = new Date();
                const daysDiff = Math.floor((now - resultDate) / (1000 * 60 * 60 * 24));

                let includeResult = false;
                switch (params.time_filter) {
                    case 'today':
                        includeResult = daysDiff === 0;
                        break;
                    case 'week':
                        includeResult = daysDiff <= 7;
                        break;
                    case 'month':
                        includeResult = daysDiff <= 30;
                        break;
                    case 'quarter':
                        includeResult = daysDiff <= 90;
                        break;
                    default:
                        includeResult = true;
                }

                if (!includeResult) continue;
            }

            $scope.results.push(result);
        }

        // Sort by date (newest first)
        $scope.results.sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date));
        console.log($scope.results);
    };

    // Generate random date within last 90 days
    function generateRandomDate() {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 90); // 0-90 days ago
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 12) + 8); // 8am-8pm
        date.setMinutes(Math.floor(Math.random() * 60));
        date.setSeconds(Math.floor(Math.random() * 60));
        return date.toISOString().replace('T', ' ').substring(0, 19);
    }

    // Calculate statistics
    $scope.calculateStats = function () {
        if ($scope.results.length === 0) {
            $scope.stats = {
                totalAttempts: 0,
                averageScore: 0,
                passRate: 0,
                activeStudents: 0,
                averageTime: '00:00',
                highestScore: 0
            };
            return;
        }

        const totalScore = $scope.results.reduce((sum, r) => sum + r.percentage, 0);
        const passedResults = $scope.results.filter(r => r.percentage >= r.passing_percentage);

        // Calculate average time in minutes
        const totalMinutes = $scope.results.reduce((sum, r) => {
            const [minutes, seconds] = r.time_taken.split(':').map(Number);
            return sum + minutes + (seconds / 60);
        }, 0);

        const avgMinutes = Math.round(totalMinutes / $scope.results.length);
        const avgSeconds = Math.round((totalMinutes / $scope.results.length - avgMinutes) * 60);

        // Get unique students
        const uniqueStudents = [...new Set($scope.results.map(r => r.student_id))];

        // Find highest score
        const highestScore = Math.max(...$scope.results.map(r => r.percentage));

        $scope.stats = {
            totalAttempts: $scope.results.length,
            averageScore: Math.round(totalScore / $scope.results.length),
            passRate: Math.round((passedResults.length / $scope.results.length) * 100),
            activeStudents: uniqueStudents.length,
            averageTime: `${avgMinutes.toString().padStart(2, '0')}:${avgSeconds.toString().padStart(2, '0')}`,
            highestScore: highestScore
        };
    };

    // Apply filters to results
    $scope.applyFilters = function () {
        let filtered = [...$scope.results];

        switch ($scope.currentFilter) {
            case 'passed':
                filtered = filtered.filter(r => r.percentage >= r.passing_percentage);
                break;
            case 'failed':
                filtered = filtered.filter(r => r.percentage < r.passing_percentage);
                break;
            case 'recent':
                // Show last 7 days
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(r => new Date(r.completed_date) > weekAgo);
                break;
            case 'top':
                // Top 20% scores
                filtered.sort((a, b) => b.percentage - a.percentage);
                filtered = filtered.slice(0, Math.ceil(filtered.length * 0.2));
                break;
        }

        $scope.filteredResults = filtered;
    };

    // Set filter
    $scope.setFilter = function (filter) {
        $scope.currentFilter = filter;
        $scope.currentPage = 1;
        $scope.applyFilters();
        $scope.calculatePagination();
    };

    // Clear all filters
    $scope.clearFilters = function () {
        $scope.selectedStudent = null;
        $scope.selectedExam = '';
        $scope.timeFilter = 'all';
        $scope.currentFilter = 'all';
        $scope.currentPage = 1;
        $scope.loadResults();
    };

    // Select student
    $scope.selectStudent = function (id, name) {
        $scope.selectedStudent = { id: id, name: name };
        $scope.currentPage = 1;
        $scope.loadResults();
    };

    // Pagination functions
    $scope.calculatePagination = function () {
        $scope.totalPages = Math.ceil($scope.filteredResults.length / $scope.pageSize);
        if ($scope.currentPage > $scope.totalPages) {
            $scope.currentPage = 1;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
        }
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };

    // Get paginated results
    $scope.getPaginatedResults = function () {
        const start = ($scope.currentPage - 1) * $scope.pageSize;
        const end = start + $scope.pageSize;
        return $scope.filteredResults.slice(start, end);
    };

    // Export functions
    $scope.exportResult = function (resultId) {
        const result = $scope.results.find(r => r.id === resultId);
        if (result) {
            alert(`Exporting result for ${result.student_name} - ${result.exam_title}`);
            // In real implementation, trigger file download
        }
    };

    $scope.exportAllResults = function () {
        alert(`Exporting all ${$scope.results.length} results as CSV`);
        // In real implementation, trigger bulk export
    };

    // Send reports
    $scope.sendStudentReport = function (studentId, resultId) {
        const result = $scope.results.find(r => r.id === resultId && r.student_id === studentId);
        if (result) {
            alert(`Sending report to ${result.student_name} for ${result.exam_title}`);
            // In real implementation, send email with report
        }
    };

    $scope.sendReports = function () {
        alert(`Sending reports to all ${$scope.results.length} students`);
        // In real implementation, batch send reports
    };

    // Performance evaluation helpers
    $scope.getPerformanceColor = function (score) {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    $scope.getPerformanceIcon = function (score) {
        if (score >= 80) return 'fa-arrow-up';
        if (score >= 60) return 'fa-minus';
        return 'fa-arrow-down';
    };

    $scope.getPerformanceLabel = function (score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Improvement';
    };

    // Format date/time filter (if not in parent scope)
    $scope.formatDateTime = function (dateString, format) {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        if (format === 'MMM DD, YYYY') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else if (format === 'MMM DD') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } else if (format === 'hh:mm A') {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } else if (format === 'MMM DD, YYYY hh:mm A') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        return dateString;
    };

    // Close dropdown when clicking outside
    $scope.$watch('dropdownOpen', function (newVal) {
        if (newVal) {
            $timeout(function () {
                angular.element(document).on('click', function (event) {
                    if (!event.target.closest('.relative')) {
                        $scope.$apply(function () {
                            $scope.dropdownOpen = false;
                        });
                    }
                });
            });
        }
    });

    // Initialize on load
    $scope.init();
}]);