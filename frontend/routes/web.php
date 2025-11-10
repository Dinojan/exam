<?php 
Router::get('/', 'DashboardAPI@dashboard', 'home',['auth']);
Router::get('/login', 'AuthAPI@showLogin', name: 'login');
Router::get('/dashboard', 'DashboardAPI@dashboard', 'dashboard');
// Router::group(['prefix' => 'admin', 'middleware' => ['auth']], function() {
//     Router::get('/dashboard', 'DashboardAPI@dashboard', 'dashboard');
// });

Router::post('/API/login', 'AuthAPI@login', 'login');
Router::post('/API/logout', 'AuthAPI@logout', 'login');
