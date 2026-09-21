<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EditorController;
use Illuminate\Support\Facades\Route;

// This makes the Dashboard the landing page
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// The editor route
Route::get('/editor', [EditorController::class, 'index'])->name('editor');

Route::post('/api/tasks', [EditorController::class, 'saveTasks'])->name('editor.tasks.save');
Route::post('/api/urgent', [EditorController::class, 'saveUrgent'])->name('editor.urgent.save');
Route::post('/api/events', [EditorController::class, 'saveEvents'])->name('editor.events.save');
Route::post('/api/payments', [EditorController::class, 'savePayments'])->name('editor.payments.save');
