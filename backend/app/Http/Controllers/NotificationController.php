<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->with('task')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ], Response::HTTP_OK);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request,int $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found.'
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();

        // Check ownership
        if ($notification->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not own this notification.'
            ], Response::HTTP_FORBIDDEN);
        }

        if (is_null($notification->read_at)) {
            $notification->update([
                'read_at' => Carbon::now()
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read.',
            'data' => $notification
        ], Response::HTTP_OK);
    }

    /**
     * Mark all unread notifications for the user as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => Carbon::now()
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read.'
        ], Response::HTTP_OK);
    }
}