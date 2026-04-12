<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class DeployDatabaseCommand extends Command
{
    protected $signature = 'koon:deploy-database
                            {--seed-only : Run Database\\Seeders only (skip migrations)}
                            {--no-seed : Run migrations only}';

    protected $description = 'Run migrate --force then db:seed --force (idempotent seeders; safe re-run on production).';

    public function handle(): int
    {
        if (! $this->option('seed-only')) {
            $this->info('Running: php artisan migrate --force');
            $exit = Artisan::call('migrate', ['--force' => true]);
            $this->output->write(Artisan::output());
            if ($exit !== 0) {
                return $exit;
            }
        }

        if ($this->option('no-seed')) {
            return 0;
        }

        $this->info('Running: php artisan db:seed --force');
        $exit = Artisan::call('db:seed', ['--force' => true]);
        $this->output->write(Artisan::output());

        return $exit;
    }
}
