<?php $this->extend('frontend'); ?>
<?php $this->controller('ResultReviewController'); ?>

<?php $this->start('content'); ?>
<div class="bg-[#0003] p-6 rounded-lg mb-16">
    <!-- Header Section -->
    <div class="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
            <a href="<?php echo BASE_URL ?>/result/my"
                class="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-2 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                <span>Back to Results</span>
            </a>
            <h1 class="text-2xl font-bold">Review Exam Results</h1>
            <p class="text-gray-400">Review your answers and understand your performance</p>
        </div>

        <!-- Exam Status Badge -->
        <div ng-if="!error" class="flex flex-row items-center justify-between space-x-4 w-full md:w-auto">
            <div class="text-center">
                <p class="text-sm text-gray-400">Overall Score</p>
                <p class="text-2xl font-bold"
                    ng-class="result.percentage >= result.passing_percentage ? 'text-green-400' : 'text-red-400'">
                    {{result.percentage}}%
                </p>
            </div>
            <div class="px-4 py-2 rounded-full" ng-class="result.percentage >= result.passing_percentage ? 
                    'bg-green-500/20 text-green-300 border border-green-500' : 
                    'bg-red-500/20 text-red-300 border border-red-500'">
                <i class="fas mr-2"
                    ng-class="result.percentage >= result.passing_percentage ? 'fa-check-circle' : 'fa-times-circle'"></i>
                {{result.percentage >= result.passing_percentage ? 'Passed' : 'Failed'}}
            </div>
        </div>
    </div>

    <!-- Loading State -->
    <div ng-if="loading" class="text-center py-12">
        <div class="max-w-md mx-auto">
            <i class="fas fa-spinner animate-spin text-cyan-500 text-4xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-100 mb-2">Loading Review...</h3>
            <p class="text-gray-400">Preparing your exam analysis</p>
        </div>
    </div>

    <!-- Main Review Content -->
    <div ng-cloak ng-if="!loading && result" class="space-y-6">
        <!-- Exam Summary Card -->
        <div class="bg-[#0005] p-6 rounded-xl border border-[#fff2] mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Exam Info -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-200 capitalize mb-2">{{result.exam_title}}</h3>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-400 flex items-center">
                            <i class="fas fa-hashtag text-cyan-400 mr-2 w-4"></i>
                            Code: <span class="uppercase ml-1 text-gray-300">{{result.exam_code}}</span>
                        </p>
                        <p class="text-sm text-gray-400 flex items-center">
                            <i class="fas fa-calendar-alt text-cyan-400 mr-2 w-4"></i>
                            Completed: <span class="ml-1 text-gray-300">{{result.completed_date | formatDateTime: 'MMM
                                DD, YYYY hh:mm A'}}</span>
                        </p>
                    </div>
                </div>

                <!-- Score Details -->
                <div class="space-y-3">
                    <div>
                        <p class="text-sm text-gray-400">Score</p>
                        <p class="text-xl font-bold text-gray-100">{{result.score}}/{{result.total_marks}}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Passing Percentage</p>
                        <p class="text-lg text-gray-300">{{result.passing_percentage}}%</p>
                    </div>
                </div>

                <!-- Time Stats -->
                <div class="space-y-3">
                    <div>
                        <p class="text-sm text-gray-400">Time Taken</p>
                        <p class="text-xl font-bold text-gray-100">{{result.time_taken}}</p>
                        <p class="text-xs"
                            ng-class="result.time_taken_percentage <= 80 ? 'text-green-400' : 'text-yellow-400'">
                            {{result.time_taken_percentage}}% of duration
                        </p>
                    </div>
                </div>

                <!-- Performance Breakdown -->
                <div class="flex flex-row items-start justify-around gap-4">
                    <div class="text-center p-2 bg-green-500/10 rounded-lg w-full">
                        <p class="text-sm text-gray-400">Correct</p>
                        <p class="text-lg font-bold text-green-400">{{result.correct_answers}}/{{result.total_questions}}</p>
                    </div>
                    <div class="text-center p-2 bg-red-500/10 rounded-lg w-full">
                        <p class="text-sm text-gray-400">Incorrect</p>
                        <p class="text-lg font-bold text-red-400">{{result.incorrect_answers}}/{{result.total_questions}}</p>
                    </div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-6">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-400">Performance Progress</span>
                    <!-- <span class="text-gray-300">{{result.percentage}}%</span> -->
                </div>
                <div class="w-full bg-gray-700 rounded-full h-5">
                    <div class="h-5 rounded-full transition-all duration-500 text-center text-sm"
                        ng-class="result.percentage >= result.passing_percentage ? 'bg-green-500' : 'bg-red-500'"
                        ng-style="{'width': result.percentage + '%'}">{{result.percentage}}%</div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>Passing: {{result.passing_percentage}}%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>

        <!-- Review Tabs Navigation -->
        <!-- <div class="border-b border-gray-700">
            <nav class="flex space-x-1">
                <button ng-click="setActiveTab('answers')"
                        ng-class="{'bg-[#0005] text-cyan-400 border-b-2 border-cyan-400': activeTab === 'answers', 
                                 'text-gray-400 hover:text-gray-300': activeTab !== 'answers'}"
                        class="px-4 py-3 text-sm font-medium rounded-t-lg transition-colors">
                    <i class="fas fa-list-check mr-2"></i>
                    Question-wise Review
                </button>
                <button ng-click="setActiveTab('analysis')"
                        ng-class="{'bg-[#0005] text-cyan-400 border-b-2 border-cyan-400': activeTab === 'analysis', 
                                 'text-gray-400 hover:text-gray-300': activeTab !== 'analysis'}"
                        class="px-4 py-3 text-sm font-medium rounded-t-lg transition-colors">
                    <i class="fas fa-chart-pie mr-2"></i>
                    Performance Analysis
                </button>
            </nav>
        </div> -->

        <!-- Tab Content -->
        <div ng-switch="activeTab">
            <!-- Question-wise Review Tab -->
            <div ng-switch-when="answers" class="space-y-6">
                <!-- Filters for Questions -->
                <div class="md:bg-[#0004] md:p-4 rounded-lg">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:flex">
                        <button ng-click="setQuestionFilter('all')" ng-class="{'bg-cyan-600 text-white': questionFilter === 'all', 
                                         'bg-[#0005] text-gray-300': questionFilter !== 'all'}"
                            class="px-4 py-2 rounded-lg transition-colors">
                            All Questions ({{result.total_questions}})
                        </button>
                        <button ng-click="setQuestionFilter('correct')" ng-class="{'bg-green-600 text-white': questionFilter === 'correct', 
                                         'bg-[#0005] text-gray-300': questionFilter !== 'correct'}"
                            class="px-4 py-2 rounded-lg transition-colors">
                            Correct ({{result.correct_answers}})
                        </button>
                        <button ng-click="setQuestionFilter('incorrect')" ng-class="{'bg-red-600 text-white': questionFilter === 'incorrect', 
                                         'bg-[#0005] text-gray-300': questionFilter !== 'incorrect'}"
                            class="px-4 py-2 rounded-lg transition-colors">
                            Incorrect ({{result.incorrect_answers}})
                        </button>
                        <button ng-click="setQuestionFilter('skipped')" ng-class="{'bg-yellow-600 text-white': questionFilter === 'skipped', 
                                         'bg-[#0005] text-gray-300': questionFilter !== 'skipped'}"
                            class="px-4 py-2 rounded-lg transition-colors">
                            Skipped ({{result.skipped_questions}})
                        </button>
                    </div>
                </div>

                <!-- Questions List -->
                <div>
                    <div ng-if="filteredQuestions.length > 0" class="md:space-y-4">
                        <div ng-repeat="question in filteredQuestions" id="question-{{question.question_no}}"
                            class="md:bg-[#0005] rounded-xl border border-transparent md:border-[#fff2] md:hover:border-cyan-500/50 transition-colors
                            relative before:content-[''] md:before:content-none before:absolute before:top-0 before:left-0 before:h-[1px] before:w-full before:bg-gradient-to-r before:from-transparent before:via-gray-500 before:to-transparent">
                            <div class="md:p-6">
                                <!-- Question Header -->
                                <div class="flex justify-between items-start mt-6 md:mt-0 mb-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="flex items-center justify-center w-8 h-8 rounded-lg" ng-class="{
                                             'bg-green-500/20 text-green-400 border border-green-500': question.status === 'correct',
                                             'bg-red-500/20 text-red-400 border border-red-500': question.status === 'incorrect',
                                             'bg-yellow-500/20 text-yellow-400 border border-yellow-500': question.status === 'skipped',
                                             'bg-gray-700 text-gray-400 border border-gray-600': question.status === 'unanswered'
                                         }">
                                            {{question.question_no}}
                                        </div>
                                        <div>
                                            <span class="text-sm font-medium px-2 py-1 rounded-full" ng-class="{
                                                  'bg-green-500/20 text-green-300': question.status === 'correct',
                                                  'bg-red-500/20 text-red-300': question.status === 'incorrect',
                                                  'bg-yellow-500/20 text-yellow-300': question.status === 'skipped'
                                              }">
                                                <i class="fas mr-1" ng-class="{
                                                   'fa-check': question.status === 'correct',
                                                   'fa-times': question.status === 'incorrect',
                                                   'fa-forward': question.status === 'skipped'
                                               }"></i>
                                                {{question.status | uppercase}}
                                            </span>
                                            <span class="text-xs text-gray-400 ml-2">
                                                Marks: {{question.marks}}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Question Text -->
                                <div class="mb-6">
                                    <!-- <h4 class="text-gray-200 font-medium mb-3">Question:</h4> -->
                                    <div class="">
                                        <div ng-bind-html="question.question_text | safeHtml"></div>
                                    </div>
                                </div>

                                <!-- Options -->
                                <div class="mb-6">
                                    <!-- <h4 class="text-gray-200 font-medium mb-3">Options:</h4> -->
                                    <div class="grid gap-3" ng-class="{
                                    'grid-cols-1': question.grid === 1,
                                    'grid-cols-1 md:grid-cols-2': question.grid === 2,
                                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': question.grid === 4,
                                }">
                                        <div ng-repeat="option in question.options"
                                            class="p-3 rounded-lg border transition-colors" ng-class="{
                                             'bg-green-500/20 border-green-500': option.is_correct && !option.is_selected,
                                             'bg-green-500/30 border-green-500 text-white': option.is_correct && option.is_selected,
                                             'bg-red-500/30 border-red-500': !option.is_correct && option.is_selected,
                                             'bg-[#0003] border-gray-700': !option.is_correct && !option.is_selected
                                         }">
                                            <div class="flex items-center">
                                                <div class="flex flex-row items-center gap-2 flex-grow ml-2">
                                                    <div class="font-medium">{{option.op.toUpperCase()}}.</div>
                                                    <div ng-bind-html="option.text | safeHtml"></div>
                                                </div>
                                                <div ng-if="option.is_selected" class="mx-3">
                                                    <span
                                                        class="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                                                        Your Answer
                                                    </span>
                                                </div>
                                                <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                                                    ng-class="{
                                                        'border border-green-500 bg-green-500': option.is_correct,
                                                        'border border-red-500 bg-red-500': !option.is_correct && option.is_selected,
                                                    }">
                                                    <i class="fas text-xs" ng-class="{
                                                        'fa-check': option.is_correct,
                                                        'fa-times': !option.is_correct && option.is_selected
                                                    }"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Explanation (Collapsible) -->
                                <!-- <div class="mt-6" ng-if="question.explanation">
                                <button ng-click="toggleExplanation(question.question_no)"
                                        class="flex items-center justify-between w-full p-3 bg-[#0003] rounded-lg hover:bg-[#0005] transition-colors">
                                    <span class="text-cyan-400 font-medium">
                                        <i class="fas fa-lightbulb mr-2"></i>
                                        View Explanation
                                    </span>
                                    <i class="fas transition-transform"
                                       ng-class="{'fa-chevron-down': !question.showExplanation, 'fa-chevron-up': question.showExplanation}"></i>
                                </button>
                                <div ng-if="question.showExplanation" 
                                     class="mt-3 p-4 bg-[#0003] rounded-lg border border-cyan-500/30">
                                    <div ng-bind-html="question.explanation | safeHtml"></div>
                                </div>
                            </div> -->
                            </div>
                        </div>
                    </div>
                    <div ng-if="!filteredQuestions || filteredQuestions.length === 0"
                        class="flex flex-col items-center justify-center p-12 bg-[#0005] rounded-xl border border-[#fff2] text-center">
                        <i class="fas fa-clipboard-check text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-300 font-medium">
                            No questions available for review
                        </p>
                        <p class="text-sm text-gray-500 mt-1">
                            There are no questions matching the selected result filter
                        </p>
                    </div>
                </div>
            </div>

            <!-- Performance Analysis Tab -->
            <div ng-switch-when="analysis" class="space-y-6">
                <!-- Performance Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="bg-[#0005] p-4 rounded-xl border border-[#fff2]">
                        <div class="text-center">
                            <div
                                class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-bullseye text-green-400 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-bold text-gray-100">{{result.accuracy}}%</h4>
                            <p class="text-sm text-gray-400">Accuracy Rate</p>
                        </div>
                    </div>

                    <div class="bg-[#0005] p-4 rounded-xl border border-[#fff2]">
                        <div class="text-center">
                            <div
                                class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-clock text-blue-400 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-bold text-gray-100">{{result.avg_time_per_question || 'N/A'}}</h4>
                            <p class="text-sm text-gray-400">Avg Time per Question</p>
                        </div>
                    </div>

                    <div class="bg-[#0005] p-4 rounded-xl border border-[#fff2]">
                        <div class="text-center">
                            <div
                                class="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-chart-line text-purple-400 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-bold text-gray-100">{{result.difficulty_score || 'N/A'}}/10</h4>
                            <p class="text-sm text-gray-400">Difficulty Score</p>
                        </div>
                    </div>
                </div>

                <!-- Performance by Difficulty -->
                <div class="bg-[#0005] p-6 rounded-xl border border-[#fff2]">
                    <h3 class="text-lg font-semibold text-gray-200 mb-4">Performance by Difficulty Level</h3>
                    <div class="space-y-4">
                        <div ng-repeat="level in difficultyLevels" class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-300">{{level.name}}</span>
                                <span class="text-gray-400">{{level.correct}}/{{level.total}} correct</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-3">
                                <div class="h-3 rounded-full transition-all duration-500" ng-class="level.percentage >= 70 ? 'bg-green-500' : 
                                              level.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                                    ng-style="{'width': level.percentage + '%'}"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Time Management Analysis -->
                <div class="bg-[#0005] p-6 rounded-xl border border-[#fff2]">
                    <h3 class="text-lg font-semibold text-gray-200 mb-4">Time Management</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-400">Time Efficiency</span>
                                <span class="font-medium" ng-class="result.time_efficiency >= 80 ? 'text-green-400' : 
                                               result.time_efficiency >= 60 ? 'text-yellow-400' : 'text-red-400'">
                                    {{result.time_efficiency || 'N/A'}}%
                                </span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-3">
                                <div class="h-3 rounded-full transition-all duration-500" ng-class="result.time_efficiency >= 80 ? 'bg-green-500' : 
                                              result.time_efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                                    ng-style="{'width': (result.time_efficiency || 0) + '%'}"></div>
                            </div>
                            <p class="text-sm text-gray-400 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>
                                Higher percentage indicates better time management
                            </p>
                        </div>
                        <div>
                            <h4 class="text-gray-300 mb-3">Time Distribution:</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Easy Questions</span>
                                    <span class="text-gray-300">{{result.time_easy || 'N/A'}} avg</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Medium Questions</span>
                                    <span class="text-gray-300">{{result.time_medium || 'N/A'}} avg</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Hard Questions</span>
                                    <span class="text-gray-300">{{result.time_hard || 'N/A'}} avg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="bg-[#0005] p-6 rounded-xl border border-[#fff2]">
                    <h3 class="text-lg font-semibold text-gray-200 mb-4">Recommendations</h3>
                    <div class="space-y-3">
                        <div ng-repeat="rec in recommendations" class="flex items-start p-3 bg-[#0003] rounded-lg">
                            <i class="fas mr-3 mt-1 flex-shrink-0" ng-class="rec.type === 'improvement' ? 'fa-exclamation-triangle text-yellow-400' :
                                        rec.type === 'strength' ? 'fa-check-circle text-green-400' :
                                        'fa-lightbulb text-cyan-400'"></i>
                            <div>
                                <h4 class="font-medium text-gray-200">{{rec.title}}</h4>
                                <p class="text-sm text-gray-400">{{rec.description}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Solutions Tab -->
            <div ng-switch-when="solutions" class="space-y-6">
                <div class="text-center py-12">
                    <i class="fas fa-lightbulb text-cyan-400 text-6xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-100 mb-2">Detailed Solutions Coming Soon</h3>
                    <p class="text-gray-400 mb-6">We're working on providing detailed solutions and explanations for
                        each question.</p>
                    <div class="max-w-md mx-auto">
                        <div class="bg-[#0005] p-6 rounded-xl border border-[#fff2]">
                            <h4 class="font-medium text-gray-200 mb-3">Current Features:</h4>
                            <ul class="text-left space-y-2 text-gray-400">
                                <li class="flex items-center">
                                    <i class="fas fa-check text-green-400 mr-2"></i>
                                    Question-wise answer review
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-check text-green-400 mr-2"></i>
                                    Performance analysis by difficulty
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-check text-green-400 mr-2"></i>
                                    Time management insights
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-clock text-yellow-400 mr-2"></i>
                                    Detailed solutions (Coming soon)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Error State -->
    <div ng-cloak ng-if="!loading && error" class="text-center py-12">
        <div class="max-w-md mx-auto">
            <i class="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-100 mb-2">Unable to Load Review</h3>
            <p class="text-gray-400 mb-6">{{error}}</p>
            <div class="flex flex-wrap gap-3 justify-center">
                <a href="<?php echo BASE_URL ?>/result/my"
                    class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back to Results</span>
                </a>
                <button ng-click="reloadResultReview()"
                    class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-redo"></i>
                    <span>Try Again</span>
                </button>
            </div>
        </div>
    </div>

    <!-- No Result State -->
    <div ng-cloak ng-if="!loading && !result && !error" class="text-center py-12">
        <div class="max-w-md mx-auto">
            <i class="fas fa-search text-gray-300 text-6xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-100 mb-2">Result Not Found</h3>
            <p class="text-gray-400 mb-6">The requested exam result could not be found or you don't have permission to
                view it.</p>
            <a href="<?php echo BASE_URL ?>/result/my"
                class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors hover:scale-105 transition-transform">
                <i class="fas fa-list"></i>
                <span>View All Results</span>
            </a>
        </div>
    </div>

    <!-- Action Buttons Footer -->
    <!-- <div ng-cloak ng-if="!loading && result" class="mt-8 pt-6 border-t border-gray-700">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <div class="flex flex-wrap gap-3">
                <button onclick="window.print()"
                        class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-print"></i>
                    <span>Print Result</span>
                </button>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-download"></i>
                    <span>Download PDF</span>
                </button>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="<?php // echo BASE_URL ?>/exam/start/{{result.exam_id}}?retake=true"
                   ng-if="result.allow_retake"
                   class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-redo"></i>
                    <span>Retake Exam</span>
                </a>
                <a href="<?php // echo BASE_URL ?>/exam/all"
                   class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors">
                    <i class="fas fa-book-open"></i>
                    <span>Take Another Exam</span>
                </a>
            </div>
        </div>
    </div> -->
</div>
<?php $this->end(); ?>