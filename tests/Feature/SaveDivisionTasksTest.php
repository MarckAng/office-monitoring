<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaveDivisionTasksTest extends TestCase
{
    use RefreshDatabase;

    public function test_saves_new_divisions_and_their_tasks(): void
    {
        $response = $this->postJson(route('editor.tasks.save'), [
            'divisions' => [
                [
                    'name' => 'Administration',
                    'abbr' => 'ADM',
                    'tasks' => [
                        [
                            'title' => 'Prepare report',
                            'status' => 'ongoing',
                            'due_date' => '2026-10-01',
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseHas('divisions', [
            'name' => 'Administration',
            'abbr' => 'ADM',
            'display_order' => 0,
        ]);
        $this->assertDatabaseHas('tasks', [
            'title' => 'Prepare report',
            'status' => 'ongoing',
            'due_date' => '2026-10-01',
            'display_order' => 0,
        ]);
    }

    public function test_replaces_deleted_divisions_and_tasks_when_saving(): void
    {
        $deletedDivision = Division::create([
            'name' => 'Old Division',
            'abbr' => 'OLD',
            'display_order' => 0,
        ]);
        Task::create([
            'division_id' => $deletedDivision->id,
            'title' => 'Old task',
            'status' => 'pending',
            'display_order' => 0,
        ]);

        $response = $this->postJson(route('editor.tasks.save'), ['divisions' => []]);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseMissing('divisions', ['id' => $deletedDivision->id]);
        $this->assertDatabaseCount('tasks', 0);
    }
}
