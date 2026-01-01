<div id="confirm-user-group-delete-modal" class="">
    <div class="rounded-xl shadow-2xl max-w-md w-full">
        <div class="text-center">
            <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
            <h3 class="text-lg font-semibold text-yellow-600 mb-2">Delete User Group</h3>
            <p class="text-gray-300 mb-6">
                Are you sure you want to delete the group "{{groupToDelete.name}}"? This action cannot be undone.
            </p>
            <div class="flex space-x-3">
                <button ng-click="closeDeleteModal()"
                    class="flex-1 bg-green-600 hover:bg-grenn-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
                <button ng-click="deleteUserGroup()"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Delete Group
                </button>
            </div>
        </div>
    </div>
</div>