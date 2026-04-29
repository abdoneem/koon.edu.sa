<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'local' && config('app.log_queries')) {
            $threshold = max(1, (int) config('app.log_slow_query_ms'));
            DB::listen(function ($query) use ($threshold): void {
                $ms = (float) $query->time;
                if ($ms < $threshold) {
                    return;
                }
                Log::warning('Slow SQL query', [
                    'time_ms' => $ms,
                    'threshold_ms' => $threshold,
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'connection' => $query->connectionName,
                ]);
            });
        }
    }
}
