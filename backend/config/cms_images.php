<?php

return [
    'max_width' => (int) env('CMS_IMAGE_MAX_WIDTH', 2560),
    'max_height' => (int) env('CMS_IMAGE_MAX_HEIGHT', 2560),
    'webp_quality' => (int) env('CMS_IMAGE_WEBP_QUALITY', 82),
    'jpeg_quality' => (int) env('CMS_IMAGE_JPEG_QUALITY', 85),
];
