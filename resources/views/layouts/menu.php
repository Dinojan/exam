<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION)) {
    $_SESSION['user_permissions'] = ['read_data', 'delete_customer'];
    $_SESSION['user_group'] = 'admin';
}
$menuData = [
    [
        'id' => 'dashboard',
        'title' => 'Dashboard',
        'icon' => '📊',
        'url' => 'dashboard',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => [0, 'admin', 'user', 'viewer'],
        'children' => [],
        'open' => ['dashboard']
    ],
    [
        'id' => 'users',
        'title' => 'User Management',
        'icon' => '👥',
        'url' => '#',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => [0, 'admin', 'user', 'viewer'],
        'open' => ['users', 'create_user'],
        'children' => [
            [
                'id' => 'users_list',
                'title' => 'All Users',
                'icon' => '📋',
                'url' => 'users',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => [],
                'active' => ['users']
            ],
            [
                'id' => 'users_add',
                'title' => 'Add User',
                'icon' => '➕',
                'url' => 'add-user',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => [],
                'active' => ['create_user']
            ],
            [
                'id' => 'user_roles',
                'title' => 'Roles & Permissions',
                'icon' => '🛡️',
                'url' => '#',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => [
                    [
                        'id' => 'roles_list',
                        'title' => 'Manage Roles',
                        'icon' => '⚙️',
                        'url' => 'roles',
                        'permissions' => ['read_data', 'delete_customer'],
                        'user_group' => [0, 'admin', 'user', 'viewer'],
                        'children' => []
                    ],
                    [
                        'id' => 'permissions_list',
                        'title' => 'Manage Permissions',
                        'icon' => '🔑',
                        'url' => 'permissions',
                        'permissions' => ['read_data', 'delete_customer'],
                        'user_group' => [0, 'admin', 'user', 'viewer'],
                        'children' => []
                    ]
                ]
            ]
        ]
    ],
    [
        'id' => 'reports',
        'title' => 'Reports',
        'icon' => '📈',
        'url' => '#',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => ['admin'],
        'children' => [
            [
                'id' => 'sales_reports',
                'title' => 'Sales Reports',
                'icon' => '📊',
                'url' => 'sales-reports',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin'],
                'children' => []
            ],
            [
                'id' => 'analytics',
                'title' => 'Analytics',
                'icon' => '📉',
                'url' => 'analytics',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin'],
                'children' => []
            ]
        ]
    ],
    [
        'id' => 'products',
        'title' => 'Products',
        'icon' => '📦',
        'url' => '#',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => [0, 'admin', 'user', 'viewer'],
        'children' => [
            [
                'id' => 'products_list',
                'title' => 'All Products',
                'icon' => '📋',
                'url' => 'products',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => []
            ],
            [
                'id' => 'products_add',
                'title' => 'Add Product',
                'icon' => '➕',
                'url' => 'add-product',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => []
            ],
            [
                'id' => 'categories',
                'title' => 'Categories',
                'icon' => '📑',
                'url' => 'categories',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => [0, 'admin', 'user', 'viewer'],
                'children' => []
            ]
        ]
    ],
    [
        'id' => 'settings',
        'title' => 'Settings',
        'icon' => '⚙️',
        'url' => 'settings',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => [0, 'admin', 'user',],
        'children' => []
    ]
];

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION)) {
    $_SESSION['user_permissions'] = ['read_data', 'delete_customer'];
    $_SESSION['user_group'] = 'admin';
}
renderMenuOptions($menuData, $collapse)
    ?>