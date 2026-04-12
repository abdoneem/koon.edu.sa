<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/** Validates recursive main-menu tree: id, label, href, optional openInNewTab, optional children. */
class ValidSiteNavTree implements ValidationRule
{
    private int $nodeCount = 0;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null) {
            return;
        }
        if (! is_array($value)) {
            $fail(__('The :attribute must be an array of navigation items.'));

            return;
        }
        $this->nodeCount = 0;
        $this->walk($value, 1, $fail, $attribute);
    }

    /**
     * @param  list<mixed>  $items
     */
    private function walk(array $items, int $depth, Closure $fail, string $attribute): bool
    {
        if ($depth > 5) {
            $fail("{$attribute}: navigation nesting is too deep (max 5 levels).");

            return false;
        }
        if (count($items) > 24) {
            $fail("{$attribute}: too many items at one level (max 24).");

            return false;
        }
        foreach ($items as $i => $item) {
            if (! is_array($item)) {
                $fail("{$attribute}.{$i} must be an object.");

                return false;
            }
            $this->nodeCount++;
            if ($this->nodeCount > 48) {
                $fail("{$attribute}: too many total menu items (max 48).");

                return false;
            }
            foreach (['id', 'label', 'href'] as $key) {
                if (! isset($item[$key]) || ! is_string($item[$key])) {
                    $fail("{$attribute}.{$i}.{$key} is required and must be a string.");

                    return false;
                }
            }
            if (strlen($item['id']) > 64 || strlen($item['id']) === 0) {
                $fail("{$attribute}.{$i}.id must be 1–64 characters.");

                return false;
            }
            if (strlen($item['label']) > 200 || strlen($item['label']) === 0) {
                $fail("{$attribute}.{$i}.label must be 1–200 characters.");

                return false;
            }
            if (strlen($item['href']) > 500 || strlen($item['href']) === 0) {
                $fail("{$attribute}.{$i}.href must be 1–500 characters.");

                return false;
            }
            if (isset($item['openInNewTab']) && ! is_bool($item['openInNewTab'])) {
                $fail("{$attribute}.{$i}.openInNewTab must be true or false.");

                return false;
            }
            if (isset($item['children'])) {
                if (! is_array($item['children'])) {
                    $fail("{$attribute}.{$i}.children must be an array.");

                    return false;
                }
                if (! $this->walk($item['children'], $depth + 1, $fail, $attribute)) {
                    return false;
                }
            }
        }

        return true;
    }
}
