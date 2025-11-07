<!DOCTYPE html>
<html lang="en" dir="ltr">
@include('layouts.head')
@php $collapse = $collapse ?? config('app.collapse'); @endphp

<body class="flex min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-600 to-blue-600 overflow-x-hidden">
    @include('layouts.sidebar')
    <div class="w-full">
        @include('layouts.header')
        @yield('content')
        @include('layouts.footer')
    </div>
</body>
@include('layouts.script')

</html>