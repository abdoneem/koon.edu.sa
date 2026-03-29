<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

abstract class ContentPageFormRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $payload = $this->input('payload');
        if (is_string($payload)) {
            $decoded = json_decode($payload, true);
            $this->merge(['payload' => is_array($decoded) ? $decoded : []]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function validatedPayload(): array
    {
        /** @var array<string, mixed> $payload */
        $payload = $this->validated()['payload'];

        return $payload;
    }
}
