<?php
// session_start();
// if (!isset($_SESSION['user'])) {
//     header("Location: /NIT/exam/login?redirect=" . BASE_URL . currentNav());
// }
?>

<?php // $this->controller('mainController') ?>

<nav id="navbar"
    class="sticky top-0 flex flex-row items-center justify-between pl-1 pr-1 py-2 bg-[#0003] border-[#fff6] border-b md:rounded-br-2xl backdrop-blur transition-all duration-200 max-h-10 w-full z-[999999]">
    <button id="menu-btn" class="text-white px-3 py-1 rounded-md hover:bg-[#fff2] transition-all duration-300">
        <i class="fa-solid fa-angle-left"></i>
    </button>
    <div class="flex flex-row">
        <!-- <button id="notification"
            class="relative text-white rounded md:rounded-full hover:bg-[#fff2] transition-all duration-300 px-2 md:px-3 py-1 after:content-['99+'] after:bg-red-600 after:text-white after:absolute after:top-0 after:right-0 after:h-4 after:rounded-full after:text-xs after:font-bold after:px-1">
            <i class="fa-solid fa-bell"></i></button> -->
        <button id="full-screen"
            class="hidden md:inline-block text-white rounded md:rounded-full hover:bg-[#fff2] transition-all duration-300 px-2 md:px-3 py-1">
            <span class="hidden md:inline-block">Full screen</span> <i class="fa-solid fa-maximize"></i></button>
        <button id="logout"
            class="text-white rounded md:rounded-full  hover:bg-[#fff2] transition-all duration-300 px-2 md:px-3 py-1">
            <span class="hidden md:inline-block">Logout</span> <i class="fa-solid fa-right-from-bracket"></i>
        </button>
    </div>
</nav>