<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TimeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class TimeLogController extends Controller
{
    /**
     * Display a listing of time logs with optional filters.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        $query = TimeLog::with(['task.project', 'user']);

        // Enforce member scoping: members can only see their own time logs
        if ($user->role && $user->role->role_name === 'member') {
            $query->where('user_id', $user->id);
        } else {
            // Admin can filter by user_id
            if ($request->has('user_id') && $request->input('user_id') !== '') {
                $query->where('user_id', $request->input('user_id'));
            }
        }

        if ($request->has('task_id') && $request->input('task_id') !== '') {
            $query->where('task_id', $request->input('task_id'));
        }

        if ($request->has('project_id') && $request->input('project_id') !== '') {
            $query->whereHas('task', function ($q) use ($request) {
                $q->where('project_id', $request->input('project_id'));
            });
        }

        $timeLogs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $timeLogs
        ], Response::HTTP_OK);
    }

    /**
     * Get time logs for a specific task.
     */
    public function getTaskTimeLogs(Request $request, $taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json([
                'status' => 'error',
                'message' => 'Task not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();
        $user->load('role');

        // Security check: members can only view time logs for tasks assigned to them
        if ($user->role && $user->role->role_name === 'member' && $task->assign_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have permission to view time logs for this task.'
            ], Response::HTTP_FORBIDDEN);
        }

        $timeLogs = TimeLog::where('task_id', $taskId)->with('user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $timeLogs
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created time log for a specific task (Member only).
     */
    public function store(Request $request,int $taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json([
                'status' => 'error',
                'message' => 'Task not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();

        // Security check: members can only log time for tasks assigned to themselves
        if ($task->assign_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You can only log time for tasks assigned to you.'
            ], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'required|string',
            'hours' => ['required', 'string', 'regex:/^(?:[0-9]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/'], // format HH:MM or HH:MM:SS
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $timeLog = TimeLog::create([
            'task_id' => $taskId,
            'user_id' => $user->id,
            'description' => $request->description,
            'hours' => $request->hours,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Time log and progress note added successfully.',
            'data' => $timeLog
        ], Response::HTTP_CREATED);
    }
}