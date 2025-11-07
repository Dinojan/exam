<!DOCTYPE html>
<html lang="en" dir="ltr">
@include('layouts.head')
@php $collapse = isset($collapse) ? $collapse :config('app.collapse'); @endphp
<body class="">
    <div class="mx-auto my-auto">
        @yield('content')
    </div>
</body>
@include('layouts.script')
</html>