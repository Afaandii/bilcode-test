<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;
use App\Models\User;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use App\Models\TimeLog;
use App\Models\Notification;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable foreign key checks for clean truncation
        Schema::disableForeignKeyConstraints();
        
        Notification::truncate();
        TimeLog::truncate();
        Task::truncate();
        Project::truncate();
        Client::truncate();
        User::truncate();
        Role::truncate();

        Schema::enableForeignKeyConstraints();

        // 1. Seed Roles
        $adminRole = Role::create(['role_name' => 'admin']);
        $memberRole = Role::create(['role_name' => 'member']);

        // 2. Seed Users
        $admin = User::create([
            'role_id' => $adminRole->id,
            'name' => 'Admin ProjectPulse',
            'email' => 'admin@projectpulse.com',
            'password' => Hash::make('password'),
        ]);

        $memberJohn = User::create([
            'role_id' => $memberRole->id,
            'name' => 'John Doe',
            'email' => 'john@projectpulse.com',
            'password' => Hash::make('password'),
        ]);

        $memberJane = User::create([
            'role_id' => $memberRole->id,
            'name' => 'Jane Smith',
            'email' => 'jane@projectpulse.com',
            'password' => Hash::make('password'),
        ]);

        $memberBob = User::create([
            'role_id' => $memberRole->id,
            'name' => 'Bob Johnson',
            'email' => 'bob@projectpulse.com',
            'password' => Hash::make('password'),
        ]);

        // 3. Seed Clients
        $clientAcme = Client::create([
            'name' => 'Acme Corporation HQ',
            'contract' => '+1-555-0199',
            'company' => 'Acme Corporation',
        ]);

        $clientStark = Client::create([
            'name' => 'Tony Stark',
            'contract' => 'stark@industries.com',
            'company' => 'Stark Industries',
        ]);

        $clientWayne = Client::create([
            'name' => 'Bruce Wayne',
            'contract' => 'wayne@enterprises.com',
            'company' => 'Wayne Enterprises',
        ]);

        $clientOscorp = Client::create([
            'name' => 'Norman Osborn',
            'contract' => 'oscorp@tech.com',
            'company' => 'Oscorp Technologies',
        ]);

        // 4. Seed Projects
        $projectEcommerce = Project::create([
            'client_id' => $clientAcme->id,
            'name' => 'E-Commerce Platform Redesign',
            'brief' => 'Redesign the old e-commerce portal to boost conversion rates and improve mobile responsiveness.',
            'deadline' => '2026-10-31',
            'status' => 'active',
        ]);

        $projectTelemetry = Project::create([
            'client_id' => $clientStark->id,
            'name' => 'Iron Man Suit Telemetry Dashboard',
            'brief' => 'Create a real-time telemetry dashboard for armor suits monitoring power levels, thrusters, and weaponry.',
            'deadline' => '2026-12-15',
            'status' => 'active',
        ]);

        $projectBatcave = Project::create([
            'client_id' => $clientWayne->id,
            'name' => 'Batcave Entry Security System',
            'brief' => 'Integrate face-recognition and motion detection for batcave entry points.',
            'deadline' => '2026-06-30',
            'status' => 'completed',
        ]);

        $projectSequencing = Project::create([
            'client_id' => $clientOscorp->id,
            'name' => 'Genetic Sequencing Pipeline',
            'brief' => 'Build a fast data pipeline to sequence biological samples and store genome patterns.',
            'deadline' => '2027-01-20',
            'status' => 'active',
        ]);

        // 5. Seed Tasks
        // E-Commerce Tasks
        $taskUI = Task::create([
            'project_id' => $projectEcommerce->id,
            'assign_id' => $memberJohn->id,
            'title' => 'Frontend UI Implementation',
            'description' => 'Build clean responsive landing and product catalog pages using Tailwind and React.',
            'category' => 'frontend',
            'deadline' => '2026-09-15',
            'estimated_effort' => '5 days',
            'status' => 'in_progress',
        ]);

        $taskGateway = Task::create([
            'project_id' => $projectEcommerce->id,
            'assign_id' => $memberJane->id,
            'title' => 'Payment Gateway Integration',
            'description' => 'Integrate Stripe and Midtrans APIs to process multi-currency payments securely.',
            'category' => 'backend',
            'deadline' => '2026-10-01',
            'estimated_effort' => '3 days',
            'status' => 'todo',
        ]);

        $taskDesign = Task::create([
            'project_id' => $projectEcommerce->id,
            'assign_id' => $memberBob->id,
            'title' => 'Figma Design Mockups',
            'description' => 'Create high fidelity wireframes and user journey maps for mobile viewports.',
            'category' => 'design',
            'deadline' => '2026-08-30',
            'estimated_effort' => '4 days',
            'status' => 'done',
        ]);

        // Telemetry Dashboard Tasks
        $taskWS = Task::create([
            'project_id' => $projectTelemetry->id,
            'assign_id' => $memberJane->id,
            'title' => 'Telemetry WebSocket Handler',
            'description' => 'Implement high throughput WebSocket service to receive and parse armor sensor data.',
            'category' => 'backend',
            'deadline' => '2026-11-15',
            'estimated_effort' => '7 days',
            'status' => 'in_progress',
        ]);

        $taskTelemetryUI = Task::create([
            'project_id' => $projectTelemetry->id,
            'assign_id' => $memberJohn->id,
            'title' => 'React Telemetry UI',
            'description' => 'Implement canvas charts and real-time visualization of core heat levels.',
            'category' => 'frontend',
            'deadline' => '2026-12-01',
            'estimated_effort' => '10 days',
            'status' => 'todo',
        ]);

        // Batcave Security Tasks
        $taskCamera = Task::create([
            'project_id' => $projectBatcave->id,
            'assign_id' => $memberBob->id,
            'title' => 'Security Camera Feed Connection',
            'description' => 'Establish RTSP stream capture and buffer feeds for processing.',
            'category' => 'frontend',
            'deadline' => '2026-06-10',
            'estimated_effort' => '3 days',
            'status' => 'done',
        ]);

        $taskFaceRecog = Task::create([
            'project_id' => $projectBatcave->id,
            'assign_id' => $memberJane->id,
            'title' => 'Face Recognition Model Integration',
            'description' => 'Deploy pretrained model on local inference node and link to access control API.',
            'category' => 'backend',
            'deadline' => '2026-06-25',
            'estimated_effort' => '8 days',
            'status' => 'done',
        ]);

        // 6. Seed Time Logs
        TimeLog::create([
            'task_id' => $taskDesign->id,
            'user_id' => $memberBob->id,
            'description' => 'Initial sketches, wireframes, and user flow definitions.',
            'hours' => '04:00:00',
        ]);

        TimeLog::create([
            'task_id' => $taskDesign->id,
            'user_id' => $memberBob->id,
            'description' => 'Completed high fidelity layouts in Figma and exported assets.',
            'hours' => '06:30:00',
        ]);

        TimeLog::create([
            'task_id' => $taskUI->id,
            'user_id' => $memberJohn->id,
            'description' => 'Configured React architecture and set up Tailwind config.',
            'hours' => '03:00:00',
        ]);

        TimeLog::create([
            'task_id' => $taskWS->id,
            'user_id' => $memberJane->id,
            'description' => 'Defined WebSocket event protocol and designed DB ingestion logic.',
            'hours' => '02:15:00',
        ]);

        // 7. Seed Notifications
        Notification::create([
            'user_id' => $memberJohn->id,
            'task_id' => $taskUI->id,
            'type' => 'task_assigned',
            'title' => 'New Task Assigned',
            'message' => 'You have been assigned to the task: Frontend UI Implementation',
            'read_at' => Carbon::now(),
        ]);

        Notification::create([
            'user_id' => $memberJane->id,
            'task_id' => $taskWS->id,
            'type' => 'deadline_approaching',
            'title' => 'Task Deadline Nearing',
            'message' => 'The deadline for task Telemetry WebSocket Handler is approaching.',
            'read_at' => Carbon::now(),
        ]);
    }
}
