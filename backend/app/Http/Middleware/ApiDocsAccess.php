<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiDocsAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('local')) {
            return $next($request);
        }

        if (! (bool) env('SCRAMBLE_ENABLED', false)) {
            abort(403);
        }

        $user = (string) env('SCRAMBLE_BASIC_USER', '');
        $pass = (string) env('SCRAMBLE_BASIC_PASS', '');

        // If credentials are configured, require Basic Auth.
        if ($user !== '' || $pass !== '') {
            $givenUser = (string) $request->getUser();
            $givenPass = (string) $request->getPassword();

            $ok = hash_equals($user, $givenUser) && hash_equals($pass, $givenPass);
            if (! $ok) {
                return response('Unauthorized', 401)->header('WWW-Authenticate', 'Basic realm="API Docs"');
            }
        }

        return $next($request);
    }
}

