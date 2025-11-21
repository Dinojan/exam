app.controller('UserController', [
    "$scope", "$http", "$compile", "$timeout", "permissionModalController", "createAndEdituserGroupModalController", "deleteUserGroupModalController",
    function ($scope, $http, $compile, $timeout, permissionModalController, createAndEdituserGroupModalController, deleteUserGroupModalController) {
        // Initialize variables
        $scope.loading = true;
        $scope.error = null;
        $scope.userGroups = [];
        $scope.activeGroupMenu = null;

        // Initialize permission modal controller
        $scope.permissionModalCtrl = null;

        // Initialize controller
        $scope.init = function () {
            $scope.loadUserGroups();
            $scope.loadLoggedUserData();
            $scope.permissionModalCtrl = permissionModalController($scope);
            $scope.createAndEdituserGroupModalCtrl = createAndEdituserGroupModalController($scope);
            $scope.deleteUserGroupModalCtrl = deleteUserGroupModalController($scope);
        };

        // Load user groups on controller initialization
        $scope.loadUserGroups = function () {
            $scope.loading = true;
            $scope.error = null;

            $http({
                url: 'API/user_groups',
                method: 'GET'
            }).then(
                function (response) {
                    $scope.loading = false;
                    if (response.data && response.data.success) {
                        $scope.userGroups = response.data.data || [];
                    } else {
                        $scope.userGroups = response.data || [];
                    }
                },
                function (error) {
                    $scope.loading = false;
                    $scope.error = error.data?.message || 'Failed to load user groups from API';
                    console.error('API Error:', error);

                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: $scope.error
                    });
                }
            );
        };

        // Load available permissions from API
        $scope.loadPermissions = function () {
            $http({
                url: 'API/permissions',
                method: 'GET'
            }).then(
                function (response) {
                    if (response.data && response.data.success) {
                        $scope.permissionModules = response.data.data
                    } else {
                        $scope.permissionModules = response.data
                    }
                },
                function (error) {
                    console.error('Failed to load permissions:', error);
                }
            );
        };

        // Fetch logged user data
        $scope.loadLoggedUserData = function () {
            $http({
                url: 'API/auth/logged_user',
                method: 'GET'
            }).then(function (response) {
                $scope.theLoggedUser = response.data;
            }, function (error) {
                Toast.fire({
                    type: 'error',
                    title: 'Error!',
                    msg: 'Failed to fetch logged user data. Please refresh the page.'
                });
                console.error('Failed to fetch looged user data:', error);
            });
        }

        // Toggle group menu
        $scope.toggleGroupMenu = function (groupId) {
            $scope.activeGroupMenu = $scope.activeGroupMenu === groupId ? null : groupId;
        };

        // Create new group
        $scope.createGroup = function () {
            if (!$scope.createAndEdituserGroupModalCtrl) {
                $scope.createAndEdituserGroupModalCtrl = createAndEdituserGroupModalController($scope);
            }

            let isEditing = false;
            $scope.createAndEdituserGroupModalCtrl.init(isEditing);

            Toast.popover({
                type: "content",
                title: "Create User Group",
                apiConfig: {
                    endpoint: "create_user_group",
                    method: "GET",
                },
                size: "lg",
                buttons: [
                    {
                        text: "Cancel",
                        background: "#F44336",
                        onClick: function () {
                            $scope.createAndEdituserGroupModalCtrl.close();
                        }
                    },
                    {
                        text: "Create Group",
                        background: "#4CAF50",
                        onClick: function () {
                            $scope.createAndEdituserGroupModalCtrl.save();
                        }
                    }
                ],
                buttonPosition: "around",
                buttonWidth: "full",
                buttonContainerStyles: "padding-bottom: 1.5rem;"
            }).then(popoverInstance => {
                $timeout(() => {
                    const modal = document.getElementById('create-user-group-modal');
                    if (modal) {
                        $compile(modal)($scope);
                        $scope.$apply();
                    } else {
                        console.error('#create-user-group-modal not found');
                    }
                }, 150);
            });
        };


        // Edit group
        $scope.editGroup = function (group) {
            if (!$scope.createAndEdituserGroupModalCtrl) {
                $scope.createAndEdituserGroupModalCtrl = createAndEdituserGroupModalController($scope);
            }

            let isEditing = true;
            $scope.createAndEdituserGroupModalCtrl.init(isEditing, group);

            Toast.popover({
                type: "content",
                title: "Edit User Group",
                apiConfig: {
                    endpoint: "create_user_group",
                    method: "GET",
                },
                size: "lg",
                buttons: [
                    {
                        text: "Cancel",
                        background: "#F44336",
                        onClick: function () {
                            $scope.createAndEdituserGroupModalCtrl.close();
                        }
                    },
                    {
                        text: "Save Changes",
                        background: "#4CAF50",
                        onClick: function () {
                            $scope.createAndEdituserGroupModalCtrl.save();
                        }
                    }
                ],
                buttonPosition: "around",
                buttonWidth: "full",
                buttonContainerStyles: "padding-bottom: 1.5rem;"
            }).then(popoverInstance => {
                $timeout(() => {
                    const modal = document.getElementById('create-user-group-modal');
                    if (modal) {
                        $compile(modal)($scope);
                        $scope.$apply();
                    } else {
                        console.error('#create-user-group-modal not found');
                    }
                }, 150);
            });
        };

        $scope.setPermissions = function (group) {
            $scope.selectedGroup = group;
            if (!$scope.permissionModalCtrl) {
                $scope.permissionModalCtrl = permissionModalController($scope);
            }

            // Init permission modules before popover opens
            $scope.permissionModalCtrl.init(group);

            Toast.popover({
                type: 'apiContent',
                title: 'Set Permissions for ' + group.name,
                apiConfig: {
                    endpoint: 'permission',
                    method: 'GET'
                },
                size: 'xxl',
                buttons: [{
                    text: 'Save Permissions',
                    onClick: function () {
                        $scope.permissionModalCtrl.save();
                    }
                }],
                buttonPosition: 'end'

            }).then(popoverInstance => {
                $timeout(() => {
                    const modal = document.getElementById('permission-model');
                    if (modal) {
                        $compile(modal)($scope);
                        $scope.$apply();
                    } else {
                        console.error('#permission-model not found');
                    }
                }, 150);
            });
        };

        // Delete group
        $scope.deleteGroup = function (group) {
            if (!$scope.deleteUserGroupModalCtrl) {
                $scope.deleteUserGroupModalCtrl = deleteUserGroupModalController($scope);
            }
            $scope.deleteUserGroupModalCtrl.init(group);

            Toast.popover({
                type: 'content',
                title: 'Delete Confirmation',
                apiConfig: {
                    endpoint: 'delete_user_group',
                    method: 'GET'
                },
                size: 'md'
            }).then(popoverInstance => {
                $timeout(() => {
                    const modal = document.getElementById('confirm-user-group-delete-modal');
                    if (modal) {
                        $compile(modal)($scope);
                        $scope.$apply();
                    } else {
                        console.error('#confirm-user-group-delete-modal not found');
                    }
                }, 150);
            })
        };

        // View members
        $scope.viewMembers = function (group) {
            $http({
                url: 'API/user-groups/' + group.id + '/members',
                method: 'GET'
            }).then(
                function (response) {
                    const members = response.data?.data || response.data || [];
                    let content = '';

                    if (members.length > 0) {
                        content = `
                            <div class="max-h-96 overflow-y-auto">
                                <div class="space-y-2">
                                    ${members.map(member => `
                                        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div>
                                                <p class="font-medium">${member.name || member.email}</p>
                                                <p class="text-sm text-gray-500">${member.email}</p>
                                            </div>
                                            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${member.role || 'Member'}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    } else {
                        content = `
                            <div class="text-center py-8">
                                <i class="fas fa-users text-gray-300 text-4xl mb-3"></i>
                                <p class="text-gray-500">No members in this group</p>
                            </div>
                        `;
                    }

                    Toast.popover({
                        type: 'content',
                        title: 'Members of ' + group.name,
                        content: content,
                        size: 'md',
                        buttons: [
                            {
                                text: 'Close',
                                class: 'popover-button-primary',
                                onClick: function () { popover.destroyAll(); }
                            }
                        ]
                    });
                },
                function (error) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: 'Failed to load group members'
                    });
                }
            );
        };

        // Close modals
        $scope.closeModal = $scope.closeDeleteModal = function () {
            Toast.popover({ type: 'close' });
        };

        // Initialize the controller
        $scope.init();
    }
]);