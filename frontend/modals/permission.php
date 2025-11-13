<!-- permission-modal-template.html -->
<div id="permission-model" class=" p-4 z-50">
    <div class="">
        <!-- Header -->
        <div class="border-b border-gray-200">
            <p class="text-sm text-gray-600 mt-1">Manage what this user group can access and do</p>
        </div>

        <!-- Permissions List -->
        <div class="overflow-y-auto mt-4 w-full">
            <!-- Permissions Content -->
            <div ng-if="permissionModules.length > 0" class="space-y-4">
                <div ng-repeat="module in permissionModules" class="border border-gray-200 rounded-lg">
                    <!-- Module Header with Select All -->
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h4 class="font-medium text-gray-800">{{module.name}}</h4>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" 
                                   ng-model="module.allSelected"
                                   ng-change="selectAllInModule(module, module.allSelected)"
                                   ng-indeterminate="isModulePartialSelected(module)"
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4">
                            <span class="text-sm text-gray-600 select-none">Select All</span>
                        </label>
                    </div>
                    
                    <!-- Permissions Grid -->
                    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label ng-repeat="permission in module.permissions" 
                               class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200">
                            <input type="checkbox" 
                                   ng-model="selectedPermissions[permission.key]"
                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer">
                            <span class="text-sm text-gray-700 select-none">{{permission.name}}</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Empty State -->
            <div ng-if="permissionModules.length === 0" class="text-center py-8">
                <p class="text-gray-500">No permissions configured.</p>
            </div>
        </div>

        <!-- Actions -->
        <div class="px-6 mt-6 border-t border-gray-200 flex gap-3">
            <button ng-click="closePermissionsModal()" ng-disabled="isSaving"
                class="flex-1 bg-red-600 hover:bg-red-800 text-white py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium">
                Cancel
            </button>
            <button ng-click="savePermissions()" 
                    ng-disabled="isSaving"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center">
                <span ng-if="isSaving" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {{isSaving ? 'Saving...' : 'Save Permissions'}}
            </button>
        </div>
    </div>
</div>