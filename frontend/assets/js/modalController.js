// permissionModelController.js
app.factory("permissionModelController", [
    "API_URL",
    "window",
    "jQuery",
    "$http",
    "$sce",
    "$rootScope",
    "$compile",
    "$timeout",
    function (
        API_URL,
        window,
        $,
        $http,
        $sce,
        $rootScope,
        $compile,
        $timeout
    ) {
        return function ($scope) {
            const modalId = "permission-model";
            console.log("permissionModelController")

            $rootScope.staticPermissionData = {
                "dashboard": {
                    "name": "Dashboard",
                    "permissions": {
                        "dashboard.view": "View Dashboard"
                    }
                },
                "courses": {
                    "name": "Courses",
                    "permissions": {
                        "courses.manage": "Manage Courses",
                        "courses.view": "View Courses",
                        "courses.add": "Add Course",
                        "courses.my_courses": "View My Courses"
                    }
                },
                "lectures": {
                    "name": "Lectures",
                    "permissions": {
                        "lectures.manage": "Manage Lectures",
                        "lectures.view": "View Lectures",
                        "lectures.all": "View All Lectures",
                        "lectures.my": "View My Lectures"
                    }
                },
                "exams": {
                    "name": "Exams",
                    "permissions": {
                        "exams.create": "Create Exam",
                        "exams.view": "View Exam",
                        "exams.delete": "Delete Exam",
                        "exams.attempt": "Attempt Exam",
                        "exams.all": "View All Exams",
                        "exams.my": "View My Exams"
                    }
                },
                "questions": {
                    "name": "Questions",
                    "permissions": {
                        "questions.create": "Create Question",
                        "questions.view": "View Question",
                        "questions.edit": "Edit Question",
                        "questions.delete": "Delete Question",
                        "questions.bank": "Access Question Bank",
                        "questions.my": "View My Questions"
                    }
                },
                "past_papers": {
                    "name": "Past Papers",
                    "permissions": {
                        "past_papers.view": "View Past Papers"
                    }
                },
                "results": {
                    "name": "Results",
                    "permissions": {
                        "results.view": "View Results",
                        "results.publish": "Publish Results",
                        "results.all": "View All Results",
                        "results.my": "View My Results"
                    }
                },
                "attendance": {
                    "name": "Attendance",
                    "permissions": {
                        "attendance.manage": "Manage Attendance",
                        "attendance.view": "View Attendance",
                        "attendance.mark": "Mark Attendance",
                        "attendance.my": "View My Attendance"
                    }
                },
                "notifications": {
                    "name": "Notifications",
                    "permissions": {
                        "notifications.view": "View Notifications"
                    }
                },
                "users": {
                    "name": "User Management",
                    "permissions": {
                        "users.manage": "Manage Users",
                        "users.create": "Create Users",
                        "users.edit": "Edit Users",
                        "users.delete": "Delete Users",
                        "users.view": "View Users",
                        "students.manage": "Manage Students",
                        "teachers.manage": "Manage Teachers",
                        "parents.manage": "Manage Parents",
                        "groups.manage": "Manage User Groups"
                    }
                },
                "reports": {
                    "name": "Reports",
                    "permissions": {
                        "reports.view": "View Reports",
                        "reports.exam": "Exam Reports",
                        "reports.performance": "Student Performance Reports"
                    }
                },
                "profile": {
                    "name": "Profile",
                    "permissions": {
                        "profile.view": "View Profile",
                        "profile.edit": "Edit Profile"
                    }
                },
                "settings": {
                    "name": "Settings",
                    "permissions": {
                        "settings.manage": "Manage Settings",
                        "settings.advanced": "Advanced Settings"
                    }
                }
            };



            // Initialize permission modal scope
            $rootScope.initPermissionModal = function (group) {
                $scope.selectedGroup = group;
                $scope.selectedPermissions = {};
                $scope.permissionModules = [];
                $scope.isLoading = false;
                $scope.isSaving = false;

                console.log('Initializing permission modal for group:', group);

                // Process static permission data
                $scope.processStaticPermissionData();

                // Load current group permissions from API
                $scope.loadGroupCurrentPermissions();
            };

            $scope.processStaticPermissionData = function () {
                $scope.permissionModules = [];

                console.log('Processing static permission data:', $scope.staticPermissionData);

                for (var moduleKey in $scope.staticPermissionData) {
                    if ($scope.staticPermissionData.hasOwnProperty(moduleKey)) {
                        var module = $scope.staticPermissionData[moduleKey];
                        var moduleObj = {
                            key: moduleKey,
                            name: module.name,
                            permissions: []
                        };

                        for (var permissionKey in module.permissions) {
                            if (module.permissions.hasOwnProperty(permissionKey)) {
                                moduleObj.permissions.push({
                                    key: permissionKey,
                                    name: module.permissions[permissionKey]
                                });
                            }
                        }

                        $scope.permissionModules.push(moduleObj);
                    }
                }

                console.log('Processed permission modules:', $scope.permissionModules);

                // Force UI update
                $timeout(function () {
                    if (!$scope.$$phase) $scope.$apply();
                }, 10);
            };


            // Load current permissions for the selected group from API
            $scope.loadGroupCurrentPermissions = function () {
                if (!$scope.selectedGroup || !$scope.selectedGroup.id) {
                    console.error('No selected group or group ID');
                    return;
                }

                $http({
                    url: 'API/user_groups/' + $scope.selectedGroup.id + '/permissions',
                    method: 'GET'
                }).then(
                    function (response) {
                        console.log('Current group permissions:', response.data);
                        const currentPermissions = response.data?.permissions || response.data || [];

                        // Initialize selectedPermissions object
                        $scope.selectedPermissions = {};

                        if (currentPermissions.length > 0) {
                            currentPermissions.forEach(permission => {
                                // Handle both string and object formats
                                const permissionKey = typeof permission === 'string' ? permission : (permission.key || permission);
                                $scope.selectedPermissions[permissionKey] = true;
                            });
                        } else {
                            return
                        }

                        console.log('Selected permissions:', $scope.selectedPermissions);
                    },
                    function (error) {
                        console.error('Failed to load group permissions:', error);
                        // Initialize empty selectedPermissions even if API fails
                        $scope.selectedPermissions = {};
                    }
                );
            };

            // Save permissions to API
            $scope.savePermissions = function () {
                if (!$scope.selectedGroup || !$scope.selectedGroup.id) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error!',
                        msg: 'No group selected'
                    });
                    return;
                }

                $scope.isSaving = true;
                const selectedPerms = Object.keys($scope.selectedPermissions).filter(key => $scope.selectedPermissions[key]);

                console.log('Saving permissions:', selectedPerms);

                $http({
                    url: 'API/user_groups/' + $scope.selectedGroup.id + '/permissions',
                    method: 'PUT',
                    data: { permissions: selectedPerms }
                }).then(
                    function (response) {
                        $scope.isSaving = false;
                        console.log('Save response:', response.data);

                        Toast.fire({
                            type: 'success',
                            title: 'Success!',
                            msg: 'Permissions updated successfully'
                        });
                        $scope.closePermissionsModal();

                        // Refresh user groups in parent controller
                        if ($scope.loadUserGroups) {
                            $scope.loadUserGroups();
                        }
                    },
                    function (error) {
                        $scope.isSaving = false;
                        const errorMsg = error.data?.message || 'Failed to update permissions';
                        console.error('Save error:', error);
                        Toast.fire({
                            type: 'error',
                            title: 'Error!',
                            msg: errorMsg
                        });
                    }
                );
            };

            // Select all permissions in a module
            $scope.selectAllInModule = function (module, isSelected) {
                module.permissions.forEach(permission => {
                    $scope.selectedPermissions[permission.key] = isSelected;
                });
            };

            // Check if all permissions in module are selected
            $scope.isModuleAllSelected = function (module) {
                return module.permissions.every(permission => $scope.selectedPermissions[permission.key]);
            };

            // Check if module has some permissions selected
            $scope.isModulePartialSelected = function (module) {
                const selectedCount = module.permissions.filter(permission => $scope.selectedPermissions[permission.key]).length;
                return selectedCount > 0 && selectedCount < module.permissions.length;
            };

            // Public API
            return {
                init: function (group) {
                    $scope.initPermissionModal(group);
                },
                close: function () {
                    $scope.closePermissionsModal();
                },
                save: function () {
                    $scope.savePermissions();
                }
            };
        };
    }
]);