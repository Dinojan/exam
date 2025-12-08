<div id="question_editor_modal" class="xl:col-span-2">
    <form id="questionForm{{currentQuestion.id}}" onsubmit="return false" enctype="multipart/form-data">
        <!-- Exam ID hidden -->
        <input type="hidden" name="exam_id" ng-value="location.exam">
        <div class="flex flex-wrap md:flex-row">
            <!-- Question Text -->
            <div class="form-group w-full">
                <label class="form-label">Question Text <span class="text-red-700">*</span></label>
                <textarea ng-model="currentQuestion.question" required rows="5" class="form-input" name="question"
                    placeholder="Enter your question here..."></textarea>
            </div>

            <!-- Question Image -->
            <!-- <div class="w-full md:w-1/3 md:pl-2">
                <div class="form-group">
                    <label class="form-label">Question Image (Optional)</label>
                    <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                        <div ng-if="!currentQuestion.image">
                            <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                            <p class="text-gray-400 mb-2">Drag & drop an image or click
                                to
                                browse
                            </p>
                            <input type="file" id="questionImage" accept="image/*" class="hidden" name="questionImage"
                                ng-file-select="onQuestionImageSelect($files)">
                            <label for="questionImage"
                                class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200">
                                Browse Files
                            </label>
                        </div>
                        <div ng-if="currentQuestion.image" class="relative inline-block">
                            <img ng-src="{{currentQuestion.image}}" alt="Question Image"
                                class="max-w-full max-h-64 rounded-lg">
                            <button type="button" ng-click="currentQuestion.image = null"
                                class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>

        <!-- Multiple Choice Options -->
        <div class="space-y-4">
            <div class="flex flex-wrap items-center md:justify-between">
                <label class="form-label">Options <span class="text-red-700">*</span></label>
                <div class="hidden md:flex flext-wrap items-center space-x-3">
                    <p class="text-gray-300 font-semibold mb-1">Option Layout:</p>
                    <label class="cursor-pointer">
                        <input type="radio" class="hidden" ng-model="currentQuestion.grid" ng-value="1" name="grid">
                        <div class="px-4 py-1 rounded-lg border"
                            ng-class="currentQuestion.grid === 1 ? 'bg-purple-600/30 text-white border-purple-700' : 'bg-gray-700/30 text-gray-300 border-gray-500'">
                            1
                        </div>
                    </label>

                    <label class="cursor-pointer">
                        <input type="radio" class="hidden" ng-model="currentQuestion.grid" ng-value="2" name="grid">
                        <div class="px-4 py-1 rounded-lg border"
                            ng-class="currentQuestion.grid === 2 ? 'bg-purple-600/30 text-white border-purple-700' : 'bg-gray-700/30 text-gray-300 border-gray-500'">
                            2
                        </div>
                    </label>

                    <label class="cursor-pointer">
                        <input type="radio" class="hidden" ng-model="currentQuestion.grid" ng-value="4" name="grid">
                        <div class="px-4 py-1 rounded-lg border"
                            ng-class="currentQuestion.grid === 4 ? 'bg-purple-600/30 text-white border-purple-700' : 'bg-gray-700/30 text-gray-300 border-gray-500'">
                            4
                        </div>
                    </label>

                </div>
            </div>
            <div ng-class="{
                    'grid grid-cols-1 gap-4': currentQuestion.grid == 1,
                    'grid grid-cols-2 gap-4': currentQuestion.grid == 2,
                    'grid grid-cols-4 gap-4': currentQuestion.grid == 4
                }">
                <div ng-repeat="option in currentQuestion.options track by $index" class="flex items-center space-x-3">
                    <label for="option{{$index}}" class="flex space-x-3">
                        <input type="radio" id="option{{$index}}" name="answer" ng-model="currentQuestion.correctAnswer"
                            ng-value="option.op" class="text-cyan-500 cursor-pointer">
                        <p>{{ option.op }}&#x29;</p>
                    </label>

                    <div class="flex-1 flex items-center gap-3">
                        <input type="text" ng-model="option.text"
                            class="w-full rounded-lg px-4 py-3 border border-gray-600 text-gray-100 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            ng-class="option.op.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? 'bg-green-900/30' : 'bg-[#0004]'"
                            name="{{option.op}}" placeholder="Option {{ option.op }} text">
                        <!-- <div id="{{ option.op }}ImgContainer" ng-if="option.image" class="relative inline-block">
                            <img ng-src="{{option.image}}" class="max-w-32 max-h-32 rounded">
                            <button type="button" ng-click="removeOptionImage(option)"
                                class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs">
                                <i class="fas fa-times"></i>
                            </button>
                        </div> -->
                    </div>

                    <!-- <div class="flex space-x-2">
                        <button type="button" ng-click="uploadOptionImage(option)"
                            class="text-purple-400 hover:text-purple-300">
                            <i class="fas fa-image"></i>
                        </button>

                        <button type="button" ng-click="removeOption(currentQuestion, $index)"
                            ng-disabled="currentQuestion.options.length <= 2"
                            class="text-red-400 hover:text-red-300 disabled:opacity-50">
                            <i class="fas fa-times"></i>
                        </button>
                    </div> -->
                </div>
            </div>


            <!-- <div class="flex space-x-3">
                <button type="button" ng-click="addOption(currentQuestion)"
                    class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span>Add Text Option</span>
                </button>
            </div> -->
        </div>
        <!-- Question Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-600 mt-2">
            <!-- Marks -->
            <div class="form-group">
                <label class="form-label">Marks <span class="text-red-700">*</span></label>
                <input type="number" ng-model="currentQuestion.marks" required min="0.5" name="marks" step="0.5"
                    class="form-input" placeholder="Marks">
            </div>
        </div>
    </form>
</div>