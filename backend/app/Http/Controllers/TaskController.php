<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks with optional filters.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        $query = Task::with(['project', 'assignee']);

        // Enforce member scoping: members can only see their own tasks
        if ($user->role && $user->role->role_name === 'member') {
            $query->where('assign_id', $user->id);
        } elseif ($request->has('assignee') && $request->input('assignee') !== '') {
            $query->where('assign_id', $request->input('assignee'));
        }

        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('project_id') && $request->input('project_id') !== '') {
            $query->where('project_id', $request->input('project_id'));
        }

        $tasks = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $tasks
        ], Response::HTTP_OK);
    }

    /**
     * Get tasks for a specific project.
     */
    public function getProjectTasks(int $projectId)
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json([
                'status' => 'error',
                'message' => 'Project not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $tasks = Task::where('project_id', $projectId)->with('assignee')->get();

        return response()->json([
            'status' => 'success',
            'data' => $tasks
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created task under a project (Admin only).
     */
    public function store(Request $request,int  $projectId)
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json([
                'status' => 'error',
                'message' => 'Project not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'assign_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|in:frontend,backend,design,QA',
            'deadline' => 'required|date_format:Y-m-d',
            'estimated_effort' => 'required|string',
            'status' => 'required|string|in:todo,in_progress,review,done',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $taskData = $request->only([
            'assign_id', 'title', 'description', 'category', 'deadline', 'estimated_effort', 'status'
        ]);
        $taskData['project_id'] = $projectId;

        $task = Task::create($taskData);
        $task->load(['project', 'assignee']);

        // Create in-app notification for the assignee
        Notification::create([
            'user_id' => $task->assign_id,
            'task_id' => $task->id,
            'type' => 'task_assigned',
            'title' => 'New Task Assigned',
            'message' => "You have been assigned to the task: {$task->title}",
            'read_at' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully.',
            'data' => $task
        ], Response::HTTP_CREATED);
    }

    /**
     * Update specified task (Admin only).
     */
    public function update(Request $request,int $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'status' => 'error',
                'message' => 'Task not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'assign_id' => 'sometimes|required|exists:users,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|in:frontend,backend,design,QA',
            'deadline' => 'sometimes|required|date_format:Y-m-d',
            'estimated_effort' => 'sometimes|required|string',
            'status' => 'sometimes|required|string|in:todo,in_progress,review,done',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $oldAssignId = $task->assign_id;

        $task->update($request->only([
            'assign_id', 'title', 'description', 'category', 'deadline', 'estimated_effort', 'status'
        ]));
        $task->load(['project', 'assignee']);

        // If the assignee changed, create a new notification
        if ($request->has('assign_id') && $task->assign_id !== $oldAssignId) {
            Notification::create([
                'user_id' => $task->assign_id,
                'task_id' => $task->id,
                'type' => 'task_assigned',
                'title' => 'New Task Assigned',
                'message' => "You have been assigned to the task: {$task->title}",
                'read_at' => null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Task updated successfully.',
            'data' => $task
        ], Response::HTTP_OK);
    }

    /**
     * Update task status (Member only).
     */
    public function updateStatus(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'status' => 'error',
                'message' => 'Task not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();

        // Security check: member can only update the status of their assigned tasks
        if ($task->assign_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You can only update the status of tasks assigned to you.'
            ], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:todo,in_progress,review,done',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $task->update(['status' => $request->status]);
        $task->load(['project', 'assignee']);

        return response()->json([
            'status' => 'success',
            'message' => "Task status updated to {$request->status} successfully.",
            'data' => $task
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'status' => 'error',
                'message' => 'Task not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $task->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Task deleted successfully.'
        ], Response::HTTP_OK);
    }
}