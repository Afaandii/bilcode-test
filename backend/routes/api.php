<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimeLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================
// Public Authentication Routes
// ==========================================
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// ==========================================
// Authenticated Routes (Sanctum Protected)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Profile and Logout
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // ==========================================
    // Client Management (Admin Only)
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('clients', ClientController::class);
    });

    // ==========================================
    // Project Management
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    });
    // Detail project is viewable by both admin and member
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->middleware('role:admin,member');

    // ==========================================
    // Task Management
    // ==========================================
    // List project tasks: viewable by both admin and member
    Route::get('/projects/{projectId}/tasks', [TaskController::class, 'getProjectTasks'])->middleware('role:admin,member');
    
    // Store task: Admin only
    Route::post('/projects/{projectId}/tasks', [TaskController::class, 'store'])->middleware('role:admin');

    // Generate tasks via AI: Admin only
    Route::post('/projects/{id}/tasks/generate', [TaskController::class, 'generateTasks'])->middleware('role:admin');

    // Update & Delete task: Admin only
    Route::patch('/tasks/{id}', [TaskController::class, 'update'])->middleware('role:admin');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->middleware('role:admin');

    // Update task status: Member only
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus'])->middleware('role:member');

    // List all tasks (with filters: assignee, status, project_id): Viewable by both
    Route::get('/tasks', [TaskController::class, 'index'])->middleware('role:admin,member');

    // Get specific task detail: Viewable by both (with role checks in controller)
    Route::get('/tasks/{id}', [TaskController::class, 'show'])->middleware('role:admin,member');

    // ==========================================
    // Time Logs
    // ==========================================
    // Store time log: Member only
    Route::post('/tasks/{id}/time-logs', [TimeLogController::class, 'store'])->middleware('role:member');
    // Get task specific time logs: Viewable by both
    Route::get('/tasks/{id}/time-logs', [TimeLogController::class, 'getTaskTimeLogs'])->middleware('role:admin,member');
    // List all time logs (with filters): Viewable by both
    Route::get('/time-logs', [TimeLogController::class, 'index'])->middleware('role:admin,member');

    // ==========================================
    // Notifications (Admin & Member)
    // ==========================================
    Route::get('/notifications', [NotificationController::class, 'index'])->middleware('role:admin,member');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->middleware('role:admin,member');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->middleware('role:admin,member');

    // ==========================================
    // Dashboard Summary (Admin Only)
    // ==========================================
    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->middleware('role:admin');
});
