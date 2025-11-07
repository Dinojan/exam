<!DOCTYPE html>
<html lang="en" dir="ltr">
@include('layouts.head')

<body class="flex min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-600 to-blue-600 overflow-x-hidden">
    @include('layouts.sidebar')
    @include('layouts.header')
    @yield('content')
    @include('layouts.footer')
</body>
@include('layouts.script')

</html>