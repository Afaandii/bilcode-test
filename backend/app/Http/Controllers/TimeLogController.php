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