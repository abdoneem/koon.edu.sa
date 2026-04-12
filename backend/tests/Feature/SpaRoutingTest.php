<?php

namespace Tests\Feature;

class SpaRoutingTest extends FeatureTestCase
{
    public function test_nested_paths_serve_spa_when_index_html_exists(): void
    {
        $index = public_path('index.html');
        $created = false;
        if (! is_file($index)) {
            file_put_contents($index, '<!doctype html><html><body></body></html>');
            $created = true;
        }

        try {
            $this->get('/admin/login')->assertOk();
            $this->get('/about')->assertOk();
            $this->get('/registration')->assertOk();
        } finally {
            if ($created) {
                @unlink($index);
            }
        }
    }
}
