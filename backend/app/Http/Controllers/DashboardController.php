<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class DashboardController extends Controller
{
    /**
     * Get a summary of active projects, overdue tasks, and workload per member (Admin only).
     */
    public function summary()
    {
        // 1. Active Projects Count
        $activeProjectsCount = Project::where('status', 'active')->count();

        // 2. Overdue Tasks Count
        // Tasks where status is not 'done' and deadline is strictly before today
        $today = Carbon::now()->format('Y-m-d');
        $overdueTasksCount = Task::where('status', '!=', 'done')
            ->where('deadline', '<', $today)
            ->count();

        // 3. Workload per Member
        // Get all members and count their tasks that are not done
        $membersWorkload = User::whereHas('role', function ($query) {
                $query->where('role_name', 'member');
            })
            ->withCount(['tasks' => function ($query) {
                $query->where('status', '!=', 'done');
            }])
            ->get(['id', 'name', 'email'])
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'active_tasks_count' => $member->tasks_count,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_projects_count' => $activeProjectsCount,
                'overdue_tasks_count' => $overdueTasksCount,
                'members_workload' => $membersWorkload,
            ]
        ], Response::HTTP_OK);
    }
}
