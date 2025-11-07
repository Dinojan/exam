<?php
// core/helpers.php
use Core\View;
if (!function_exists('route')) {
    function route($name, $parameters = []) {
        $router = Router::getInstance();
        return $router->url($name, $parameters);
    }
}


// Global view helper (add to helpers.php)
function view($view, $data = []) {
    // use Core\View;
   $viewPath = __DIR__ . "/../resources/views/" . str_replace('.', '/', $view) . ".php";
    $viewEngine = new View($data);
    return $viewEngine->render($viewPath, $data);
}

// view_path helper for includes
function view_path($view) {
    return __DIR__ . "/../resources/views/" . str_replace('.', '/', $view) . ".php";
}


// Fake auth() for demo (replace with your auth system)
function auth() {
    return (object) ['check' => function() { return isset($_SESSION['user']); }];
}
function csrf_token() { return bin2hex(random_bytes(32)); }

function currentNav()
{
    $current = strtok($_SERVER['REQUEST_URI'], '?');
    $current = str_replace('/NIT/exam/', '', $current);
    return $current;
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

if (!function_exists('asset')) {
    function asset(string $path)
    {
        // Detect protocol (http / https)
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];

        // Determine base directory (relative to web root)
        $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');

        // Remove '/public' if it exists at the end or in middle of the path
        $base = preg_replace('#/public$#', '', $base); // end of path
        $base = str_replace('/public/', '/', $base);   // middle of path

        // Build final URL
        $url = $protocol . $host . $base . '/resources/' . ltrim($path, '/');

        // Normalize duplicate slashes (except after "http://")
        $url = preg_replace('#(?<!:)//+#', '/', $url);

        return $url;
    }
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

function renderMenuOptions($menu, $collapse, $level = 0)
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

if (!function_exists('config')) {
    function config($key = null, $default = null)
    {
        static $config = null;

        if ($config === null) {
            $config = [];
            foreach (glob(__DIR__ . '/../config/*.php') as $file) {
                $name = basename($file, '.php');
                $config[$name] = require $file;
            }
        }

        if ($key === null) {
            return $config;
        }

        // Support dot notation: e.g., config('app.name')
        $keys = explode('.', $key);
        $value = $config;

        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }

        return $value;
    }
}
