<div id="section_editor_modal" class="">
    <div class="relative">
        <h3 class="text-lg font-medium text-gray-100 mb-4">
            {{editingSectionIndex === null ? 'Create New Section' : 'Edit Section'}}
        </h3>

        <div class="space-y-4">
            <form id="section_form" onsubmit="return false" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="hidden" ng-model="examID" name="exam_id" value="{{examID}}">
                <input type="hidden" ng-model="currentSection.id" name="section_id" value="{{currentSection.id}}">
                <!-- Section Title -->
                <div class="form-group">
                    <label class="form-label">Section Title <span class="text-red-700">*</span></label>
                    <input type="text" ng-model="currentSection.title" required class="form-input" name="section_title"
                        placeholder="e.g., Mathematics, Physics, etc.">
                </div>

                <!-- Questions Count -->
                <div class="form-group">
                    <label class="form-label">Number of Questions <span class="text-red-700">*</span></label>
                    <input type="number" ng-model="currentSection.question_count" required min="1"
                        name="section_question_count" class="form-input" placeholder="e.g., 10">
                </div>

                <!-- Description -->
                <div class="form-group md:col-span-2">
                    <label class="form-label">Description</label>
                    <textarea ng-model="currentSection.description" rows="3" class="form-input"
                        name="section_description" placeholder="Section description..."></textarea>
                </div>

                <button type="button" ng-click="addSecondDescription()" ng-show="!showSecondDescription"
                    class="group bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 w-auto flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 disabled:opacity-50">
                    <i class="fas fa-plus group-hover:rotate-180 transition-transform duration-300"></i>
                    Add 2nd Description
                </button>

                <!-- 2nd Description -->
                <div class="form-group md:col-span-2" ng-show="showSecondDescription">
                    <label class="form-label">2nd Description</label>
                    <textarea ng-model="currentSection.secondDescription" rows="3" class="form-input"
                        name="section_second_description" placeholder="Section 2nd description..."></textarea>
                </div>
            </form>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                <button type="button" ng-click="closeSectionEditorModal()"
                    class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                    Cancel
                </button>
                <button type="button" ng-click="saveSection()"
                    ng-disabled="!currentSection.title || !currentSection.question_count"
                    class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50">
                    {{editingSectionIndex === null ? 'Create Section' : 'Update Section'}}
                </button>
            </div>
        </div>
    </div>
</div>