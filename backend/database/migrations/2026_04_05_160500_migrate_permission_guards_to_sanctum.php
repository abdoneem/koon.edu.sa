<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Align Spatie permission rows with the Sanctum API guard (see User::$guard_name).
 * Safe no-op if tables are missing or already using sanctum.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['permissions', 'roles'] as $table) {
            if (! $this->tableExists($table)) {
                continue;
            }
            DB::table($table)->where('guard_name', 'web')->update(['guard_name' => 'sanctum']);
        }
    }

    public function down(): void
    {
        foreach (['permissions', 'roles'] as $table) {
            if (! $this->tableExists($table)) {
                continue;
            }
            DB::table($table)->where('guard_name', 'sanctum')->update(['guard_name' => 'web']);
        }
    }

    private function tableExists(string $name): bool
    {
        return DB::getSchemaBuilder()->hasTable($name);
    }
};
