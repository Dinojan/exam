<?php $logo = 'assets/img/logo.png';
$project_for = PROJECT_NAME ?>
<aside>
    <div id="sidebar"
        class="group h-screen bg-[#0003] border-[#fff6] border-r backdrop-blur transition-all duration-200 fixed md:sticky z-50 top-0 left-0 overflow-x-hidden md:hover:w-60 <?php echo $collapse ? 'w-0 md:w-16' : 'w-60'; ?>">
        <button id="menu-close" class="md:hidden rounded-full text-white absolute top-1 right-1 w-5 h-5 text-xs">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div id="logo-container" class="flex flex-row items-center gap-4 text-white p-2 border-b border-[#fff6]">
            <a href="<?php echo $base_url ?>" class="text-3xl border-2 border-white rounded-full overflow-hidden">
                <?php if (file_exists($logo)): ?>
                    <img src="<?php echo $logo; ?>" alt="Logo">
                <?php else: ?>
                    <i class="fa-solid fa-user"></i>
                <?php endif; ?>
            </a>
            <a href="<?php echo $base_url ?>" id="logo-name"
                class="flex flex-col items-start justify-between transition-all duration-300 group-hover:block <?php echo $collapse ? 'hidden' : 'block' ?>">
                <p><?php echo $project_for; ?> </p>
                <p class="text-xs">v.<?php echo VERSION ?></p>
            </a>
        </div>
        <div id="menu-container"
            class="mt-3 transition-all duration-300 group-hover:mr-3 <?php echo $collapse ? 'md:mr-0' : 'mr-3'; ?>">
            <?php include 'menu.php' ?>
        </div>
    </div>
</aside>