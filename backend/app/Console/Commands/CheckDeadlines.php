<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Notification;
use Carbon\Carbon;

class CheckDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for tasks with deadlines tomorrow (H-1) and create notifications for assignees.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        $this->info("Checking tasks with deadline set to: {$tomorrow} (H-1)...");

        // Fetch tasks due tomorrow that are not done and have an assignee
        $tasks = Task::where('deadline', $tomorrow)
            ->where('status', '!=', 'done')
            ->whereNotNull('assign_id')
            ->get();

        $count = 0;

        foreach ($tasks as $task) {
            // Check if deadline_approaching notification already exists for this task to avoid duplicates
            $exists = Notification::where('task_id', $task->id)
                ->where('user_id', $task->assign_id)
                ->where('type', 'deadline_approaching')
                ->exists();

            if (!$exists) {
                Notification::create([
                    'user_id' => $task->assign_id,
                    'task_id' => $task->id,
                    'type' => 'deadline_approaching',
                    'title' => 'Task Deadline Approaching (H-1)',
                    'message' => "The task '{$task->title}' is due tomorrow ({$task->deadline}). Please update your progress.",
                    'read_at' => null,
                ]);

                $this->line("Created deadline notification for task #{$task->id} assigned to user #{$task->assign_id}");
                $count++;
            }
        }

        $this->info("Done! Created {$count} deadline notification(s).");
    }
}
