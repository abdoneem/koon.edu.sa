<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Throwable;

class CmsImageOptimizer
{
    /**
     * Resize (if needed), re-encode to WebP when supported, else JPEG, and store on disk.
     *
     * @return array{path: string, url: string}
     */
    public function storeOptimized(UploadedFile $file, string $disk, string $directory): array
    {
        $realPath = $file->getRealPath();
        if ($realPath === false || ! is_readable($realPath)) {
            throw new \InvalidArgumentException('Upload is not readable.');
        }

        $maxW = max(1, (int) config('cms_images.max_width', 2560));
        $maxH = max(1, (int) config('cms_images.max_height', 2560));
        $webpQ = max(1, min(100, (int) config('cms_images.webp_quality', 82)));
        $jpegQ = max(1, min(100, (int) config('cms_images.jpeg_quality', 85)));

        $manager = new ImageManager(new Driver());
        $image = $manager->read($realPath);
        $image->scaleDown($maxW, $maxH);

        $useWebp = function_exists('imagewebp');
        $ext = $useWebp ? 'webp' : 'jpg';
        $name = Str::uuid()->toString().'.'.$ext;
        $relative = trim($directory, '/').'/'.$name;

        try {
            $encoded = $useWebp ? $image->toWebp($webpQ) : $image->toJpeg($jpegQ);
        } catch (Throwable $e) {
            if ($useWebp) {
                $encoded = $image->toJpeg($jpegQ);
                $ext = 'jpg';
                $name = Str::uuid()->toString().'.jpg';
                $relative = trim($directory, '/').'/'.$name;
            } else {
                throw $e;
            }
        }

        Storage::disk($disk)->put($relative, $encoded->toString());

        return [
            'path' => $relative,
            'url' => Storage::disk($disk)->url($relative),
        ];
    }

    /**
     * Whether the optimizer is likely to work on this host (GD available).
     */
    public static function isSupported(): bool
    {
        return extension_loaded('gd');
    }
}
