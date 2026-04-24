<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class CalendarEventController extends Controller
{
    private function userEmail(): ?string
    {
        $user = Session::get('user');
        if (!$user || empty($user['authenticated'])) return null;
        return $user['profile']['userPrincipalName'] ?? $user['profile']['mail'] ?? null;
    }

    public function index()
    {
        $email = $this->userEmail();
        if (!$email) return response()->json(['error' => 'Not authenticated'], 401);

        $events = DB::table('calendar_events')
            ->where('user_email', $email)
            ->orderBy('start_at')
            ->get();

        return response()->json($events->map(fn($e) => [
            'id'      => 'local-' . $e->id,
            'title'   => $e->title,
            'start'   => $e->start_at,
            'end'     => $e->end_at,
            'allDay'  => (bool) $e->all_day,
            'location'=> $e->location,
            'source'  => 'local',
            'db_id'   => $e->id,
        ]));
    }

    public function store(Request $request)
    {
        $email = $this->userEmail();
        if (!$email) return response()->json(['error' => 'Not authenticated'], 401);

        $request->validate([
            'title'    => 'required|string|max:255',
            'start'    => 'required|date',
            'end'      => 'required|date',
            'all_day'  => 'boolean',
            'location' => 'nullable|string|max:255',
        ]);

        $id = DB::table('calendar_events')->insertGetId([
            'user_email' => $email,
            'title'      => $request->title,
            'start_at'   => $request->start,
            'end_at'     => $request->end,
            'all_day'    => $request->boolean('all_day'),
            'location'   => $request->location,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Event saved'], 201);
    }

    public function destroy(int $id)
    {
        $email = $this->userEmail();
        if (!$email) return response()->json(['error' => 'Not authenticated'], 401);

        DB::table('calendar_events')->where('id', $id)->where('user_email', $email)->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
