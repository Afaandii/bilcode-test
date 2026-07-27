<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Load the role relationship
        $userRole = $user->role ? $user->role->role_name : null;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have the required role to access this resource.'
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
