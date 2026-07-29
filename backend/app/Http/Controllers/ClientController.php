<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index()
    {
        $clients = Client::all();

        return response()->json([
            'status' => 'success',
            'data' => $clients
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact' => 'required|max:255',
            'company' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $client = Client::create($request->only(['name', 'contact', 'company']));

        return response()->json([
            'status' => 'success',
            'message' => 'Client created successfully.',
            'data' => $client
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified client.
     */
    public function show(int $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $client
        ], Response::HTTP_OK);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(Request $request, int $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact' => 'sometimes|required|string|max:255',
            'company' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $client->update($request->only(['name', 'contact', 'company']));

        return response()->json([
            'status' => 'success',
            'message' => 'Client updated successfully.',
            'data' => $client
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(int $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'status' => 'error',
                'message' => 'Client not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $client->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Client deleted successfully.'
        ], Response::HTTP_OK);
    }
}