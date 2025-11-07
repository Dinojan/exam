<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION)) {
    $_SESSION['user_permissions'] = ['read_data', 'delete_customer'];
    $_SESSION['user_group'] = 'admin';
}
function currentNav()
{
    $current = strtok($_SERVER['REQUEST_URI'], '?');
    $current = str_replace('/NIT/exam/', '', $current);
    return $current;
}

$menuData = [
    [
        'id' => 'dashboard',
        'title' => 'Dashboard',
        'icon' => '📊',
        'url' => 'dashboard',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => ['admin', 'user', 'viewer'],
        'children' => [],
        'open' => ['dashboard']
    ],
    [
        'id' => 'users',
        'title' => 'User Management',
        'icon' => '👥',
        'url' => '#',
        'permissions' => ['read_data', 'delete_customer'],
        'user_group' => ['admin', 'user', 'viewer'],
        'open' => ['users', 'create_user'],
        'children' => [
            [
                'id' => 'users_list',
                'title' => 'All Users',
                'icon' => '📋',
                'url' => 'users',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
                'children' => [],
                'active' => ['users']
            ],
            [
                'id' => 'users_add',
                'title' => 'Add User',
                'icon' => '➕',
                'url' => 'add-user',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
                'children' => [],
                'active' => ['create_user']
            ],
            [
                'id' => 'user_roles',
                'title' => 'Roles & Permissions',
                'icon' => '🛡️',
                'url' => '#',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
                'children' => [
                    [
                        'id' => 'roles_list',
                        'title' => 'Manage Roles',
                        'icon' => '⚙️',
                        'url' => 'roles',
                        'permissions' => ['read_data', 'delete_customer'],
                        'user_group' => ['admin', 'user', 'viewer'],
                        'children' => []
                    ],
                    [
                        'id' => 'permissions_list',
                        'title' => 'Manage Permissions',
                        'icon' => '🔑',
                        'url' => 'permissions',
                        'permissions' => ['read_data', 'delete_customer'],
                        'user_group' => ['admin', 'user', 'viewer'],
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
        'user_group' => ['admin', 'user', 'viewer'],
        'children' => [
            [
                'id' => 'products_list',
                'title' => 'All Products',
                'icon' => '📋',
                'url' => 'products',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
                'children' => []
            ],
            [
                'id' => 'products_add',
                'title' => 'Add Product',
                'icon' => '➕',
                'url' => 'add-product',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
                'children' => []
            ],
            [
                'id' => 'categories',
                'title' => 'Categories',
                'icon' => '📑',
                'url' => 'categories',
                'permissions' => ['read_data', 'delete_customer'],
                'user_group' => ['admin', 'user', 'viewer'],
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
        'user_group' => ['admin', 'user',],
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

function hasAccess($item)
{
    $userGroupAccess = in_array($_SESSION['user_group'], $item['user_group']);
    $permissionAccess = true;
    if (!empty($item['permissions'])) {
        $permissionAccess = !empty(array_intersect($item['permissions'], $_SESSION['user_permissions']));
    }
    return $userGroupAccess && $permissionAccess;
}
function isActiveMenuItem($item, $current)
{
    if ($item['url'] == $current)
        return true;

    if (!empty($item['children'])) {
        foreach ($item['children'] as $child) {
            if (isActiveMenuItem($child, $current))
                return true;
        }
    }
    return false;
}

function renderMenuOptions($menu, $level = 0, $collapse)
{
    $current = currentNav();
    ?>
    <ul class="space-y-1">
        <?php foreach ($menu as $item): ?>
            <?php if (!hasAccess($item))
                continue; ?>
            <?php
            $hasChildren = !empty($item['children']);
            $menuId = 'menu_' . $item['id'] . '_' . $level;
            $isActive = isActiveMenuItem($item, $current);
            $checked = $isActive ? 'checked' : '';
            $activeClass = $isActive ? 'bg-[#0006] border-blue-500 border-l-red-500 border-l-2' : 'text-gray-300 hover:text-white hover:bg-[#fff6]';
            $iconClass = $isActive ? 'text-blue-500' : 'text-gray-400';
            ?>

            <li class="overflow-hidden rounded-r-lg transition-all duration-200">
                <?php if ($hasChildren): ?>
                    <input type="checkbox" id="<?= $menuId ?>" class="peer hidden" <?= $checked ?>>
                    <label for="<?= $menuId ?>"
                        class="flex items-center justify-between p-2 cursor-pointer text-white hover:bg-[#fff6]">
                        <div class="list flex items-center gap-3 group-hover:ml-0 <?php echo $collapse ? 'ml-0 md:ml-2' : ''; ?>">
                            <span class="text-lg <?= $iconClass ?>"><?= $item['icon'] ?></span>
                            <span class="menu-label font-medium transition-all duration-300 group-hover:opacity-100 group-hover:mx-0 group-hover:leading-none <?php echo $collapse ? 'md:opacity-0 md:mx-2 md:leading-3 ' : 'leading-none'; ?>"><?= $item['title'] ?></span>
                        </div>
                        <i class="fa-solid fa-chevron-right text-white transition-transform duration-300 peer-checked:rotate-90"></i>
                    </label>

                    <div class="overflow-hidden ml-2 border-l border-gray-700 transition-all duration-500 ease-in-out
                            peer-checked:opacity-100 opacity-0 
                            peer-checked:max-h-[1000px] max-h-0">
                        <?php renderMenuOptions($item['children'], $level + 1, $collapse); ?>
                    </div>

                <?php else: ?>
                    <a href="<?= $item['url'] ?>"
                        class="flex items-center gap-3 p-2 <?= $activeClass ?> transition-all duration-200">
                        <span class="list-icon text-lg <?= $iconClass ?> <?php echo $collapse ? 'md:ml-2 group-hover:ml-0' : ''; ?>"><?= $item['icon'] ?></span>
                        <span class="menu-label font-medium text-<?php echo $isActive ? 'white font-bold' : 'white' ?> group-hover:opacity-100 group-hover:mx-0 group-hover:leading-none <?php echo $collapse ? 'md:opacity-0 md:mx-2 md:leading-3' : 'leading-none'; ?>"><?= $item['title'] ?></span>
                    </a>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
    <?php
}
renderMenuOptions($menuData, 0, $collapse)
    ?>