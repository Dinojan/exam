@extends('auth.layout')
@section('content')
<!-- <div class="container bg-[#fff6] px-8 py-8 mx-auto rounded-lg shadow-lg backdrop-blur-md">
    <h1 class="mx-auto text-3xl font-bold text-center">Login</h1>
    <form action="{{ route('login') }}" method="post">
        @csrf
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" class="py-2 px-3 w-80 bg-[#0002] border-0 outline-none rounded-md text-black placeholder:text-[#fffa] focus:shadow-[0_0_0_3px_#fff6] transition-shadow duration-300" placeholder="Enter your email">
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" class="py-2 px-3 w-80 bg-[#0002] border-0 outline-none rounded-md text-black placeholder:text-[#fffa] focus:shadow-[0_0_0_3px_#fff6] transition-shadow duration-300" placeholder="Enter your password">
                <label class="flex flex-row gap-2 text-sm cursor-pointer" for="toggle-password">
                    <input type="checkbox" id="toggle-password">
                    <p>Show password</p>
                </label>
            </div>
            <div class="flex flex-col gap-2">
                <button type="submit" class="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 transition-all duration-300 text-white p-2 rounded-lg">Login</button>
                <div class="text-center text-sm text-black">Don't have an account? <a href="{{ route('register') }}"
                        class="text-blue-500">Register</a>
                </div>
            </div>
    </form>
</div> -->


<!-- Background lighting effects -->
<div class="light-effect light-left"></div>
<div class="light-effect light-right"></div>
<div class="light-effect light-center"></div>

<!-- Floating particles -->
<div class="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-60 floating"
    style="animation-delay: 0.5s;"></div>
<div class="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60 floating"
    style="animation-delay: 1s;"></div>
<div class="absolute bottom-1/4 left-1/3 w-4 h-4 bg-cyan-400 rounded-full opacity-60 floating"
    style="animation-delay: 1.5s;"></div>
<div class="absolute top-2/3 right-1/3 w-3 h-3 bg-pink-400 rounded-full opacity-60 floating"
    style="animation-delay: 2s;"></div>

<!-- Login container -->
<div class="glass-effect rounded-3xl p-8 w-full max-w-md floating" style="animation-duration: 6s;">
    <div class="text-center mb-2">
        <div class="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 pulse">
            <i class="fas fa-user text-white text-2xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-white">LOGIN</h1>
        <p class="text-blue-100 mt-2">Welcome back! Please sign in to your account</p>
    </div>

    <form class="space-y-6 mt-6">
        <div>
            <label class="block text-white text-sm font-medium mb-2" for="username">
                <i class="fas fa-user mr-2 text-blue-300"></i>Username
            </label>
            <input id="username" type="text"
                class="glass-effect w-full px-4 py-3 rounded-xl text-white placeholder-blue-200 focus:outline-none input-glow transition-all duration-300"
                placeholder="Enter your username">
        </div>

        <div>
            <label class="block text-white text-sm font-medium mb-2" for="password">
                <i class="fas fa-lock mr-2 text-blue-300"></i>Password
            </label>
            <input id="password" type="password"
                class="glass-effect w-full px-4 py-3 rounded-xl text-white placeholder-blue-200 focus:outline-none input-glow transition-all duration-300"
                placeholder="Enter your password">
        </div>

        <div class="flex items-center justify-end">
            <div class=" items-center hidden">
                <input id="remember-me" type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <label for="remember-me" class="ml-2 block text-sm text-blue-200">Remember me</label>
            </div>

            <a href="#" class="text-sm text-blue-200 hover:text-white transition-colors duration-300">
                Forgot password?
            </a>
        </div>

        <button type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold btn-glow hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 mt-4">
            SIGN IN
        </button>
    </form>

<script>
    // Simple form validation
    document.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            // Add success animation
            const button = document.querySelector('button[type="submit"]');
            button.innerHTML = '<i class="fas fa-check mr-2"></i> Success! Redirecting...';
            button.classList.remove('from-blue-500', 'to-indigo-600', 'hover:from-blue-600', 'hover:to-indigo-700');
            button.classList.add('from-green-500', 'to-emerald-600', 'hover:from-green-600', 'hover:to-emerald-700');

            // In a real application, you would send this data to a server
            setTimeout(() => {
                alert('Login successful!');
                // Reset form
                button.innerHTML = 'SIGN IN';
                button.classList.remove('from-green-500', 'to-emerald-600', 'hover:from-green-600', 'hover:to-emerald-700');
                button.classList.add('from-blue-500', 'to-indigo-600', 'hover:from-blue-600', 'hover:to-indigo-700');
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
            }, 1500);
        } else {
            // Add error animation
            const inputs = document.querySelectorAll('input');
            inputs.forEach(input => {
                if (!input.value) {
                    input.classList.add('animate-pulse');
                    input.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.7)';
                    setTimeout(() => {
                        input.classList.remove('animate-pulse');
                        input.style.boxShadow = '';
                    }, 2000);
                }
            });

            alert('Please fill in all fields');
        }
    });

    // Add focus effects to inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('transform', 'scale-105');
            this.parentElement.classList.add('transition-transform', 'duration-300');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('transform', 'scale-105');
        });
    });
</script>
@endsection