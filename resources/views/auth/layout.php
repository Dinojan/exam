<!DOCTYPE html>
<html lang="en" dir="ltr">
@include('layouts.head')
@php $collapse = isset($collapse) ? $collapse :config('app.collapse'); @endphp
<body class="flex flex-row justify-center items-center min-h-[100vh] overflow-hidden relative bg-gradient-to-br from-[#0f172a] from-0% via-[#1e293b] via-50% to-[#334155] to-100%">
    <div class="mx-auto my-auto">
        @yield('content')
    </div>
</body>
@include('auth.login-script')
</html>