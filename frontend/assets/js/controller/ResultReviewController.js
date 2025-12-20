app.controller('ResultReviewController', ['$scope', '$timeout', '$location', '$http', function ($scope, $timeout, $location, $http) {
    $scope.loading = true;
    $scope.error = null;
    $scope.result = null;
    $scope.activeTab = 'answers';
    $scope.questionFilter = 'all';
    $scope.jumpToQuestion = '';
    $scope.filteredQuestions = [];
    $scope.examId = getIdFromUrl();


    function init() {
        loadResultReview();
    }


    function loadResultReview() {
        $http.get(window.baseUrl + '/API/results/review/' + $scope.examId)
            .then(function (response) {
                if (response.data && response.data.status === 'success') {
                    $scope.result = response.data.result;
                    $scope.result.questions = response.data.questions;
                    filterQuestions();
                    $scope.loading = false;
                } else {
                    $scope.error = response.data.msg || 'Failed to load exam results. Please try again.';
                }
            })
    }

    // Tab Management
    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;
    };

    // Question Filtering
    $scope.setQuestionFilter = function (filter) {
        $scope.questionFilter = filter;
        filterQuestions();
    };

    function filterQuestions() {
        if (!$scope.result || !$scope.result.questions) return;

        switch ($scope.questionFilter) {
            case 'all':
                $scope.filteredQuestions = $scope.result.questions;
                break;
            case 'correct':
                $scope.filteredQuestions = $scope.result.questions.filter(q => q.status === 'correct');
                break;
            case 'incorrect':
                $scope.filteredQuestions = $scope.result.questions.filter(q => q.status === 'incorrect');
                break;
            case 'skipped':
                $scope.filteredQuestions = $scope.result.questions.filter(q => q.status === 'skipped');
                break;
            default:
                $scope.filteredQuestions = $scope.result.questions;
        }
    }

    // Question Navigation
    $scope.scrollToQuestion = function () {
        if ($scope.jumpToQuestion) {
            const element = document.getElementById('question-' + $scope.jumpToQuestion);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Highlight the question briefly
                element.classList.add('ring-2', 'ring-cyan-500');
                $timeout(() => {
                    element.classList.remove('ring-2', 'ring-cyan-500');
                }, 2000);
            }
        }
    };

    // Toggle Explanation
    $scope.toggleExplanation = function (questionNo) {
        const question = $scope.result.questions.find(q => q.question_no === questionNo);
        if (question) {
            question.showExplanation = !question.showExplanation;
        }
    };

    // Clear Filters
    $scope.clearFilters = function () {
        $scope.questionFilter = 'all';
        $scope.filterQuestions();
        $scope.jumpToQuestion = '';
    };

    // Reload function for error recovery
    $scope.reloadResultReview = function () {
        $scope.loading = true;
        $scope.error = null;
        loadResultReview();
    };

    // Performance evaluation helpers (if not in parent scope)
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

    // Initialize
    init();
}]);