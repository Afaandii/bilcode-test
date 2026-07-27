<?php

namespace App\Http\Controllers;

use App\Models\Project;
// use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index()
    {
        $projects = Project::with('client')->get();

        return response()->json([
            'status' => 'success',
            'data' => $projects
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'brief' => 'required|string',
            'deadline' => 'required|date_format:Y-m-d',
            'status' => 'required|string|in:active,completed,on_hold',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $project = Project::create($request->only(['client_id', 'name', 'brief', 'deadline', 'status']));
        $project->load('client');

        return response()->json([
            'status' => 'success',
            'message' => 'Project created successfully.',
            'data' => $project
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified project.
     */
    public function show(int $id)
    {
        $project = Project::with(['client', 'tasks.assignee'])->find($id);

        if (!$project) {
            return response()->json([
                'status' => 'error',
                'message' => 'Project not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request,int $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'status' => 'error',
                'message' => 'Project not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'client_id' => 'sometimes|required|exists:clients,id',
            'name' => 'sometimes|required|string|max:255',
            'brief' => 'sometimes|required|string',
            'deadline' => 'sometimes|required|date_format:Y-m-d',
            'status' => 'sometimes|required|string|in:active,completed,on_hold',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $project->update($request->only(['client_id', 'name', 'brief', 'deadline', 'status']));
        $project->load('client');

        return response()->json([
            'status' => 'success',
            'message' => 'Project updated successfully.',
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(int $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'status' => 'error',
                'message' => 'Project not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $project->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Project deleted successfully.'
        ], Response::HTTP_OK);
    }
}