<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

// This makes the Dashboard the landing page
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:6,1')->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/editor', [EditorController::class, 'index'])->name('editor');
    Route::post('/editor/dashboard', [EditorController::class, 'saveDashboard'])->name('editor.dashboard.save');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
