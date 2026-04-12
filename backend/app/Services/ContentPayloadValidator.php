<?php

namespace App\Services;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ContentPayloadValidator
{
    public function validate(string $slug, array $payload): void
    {
        $rules = match ($slug) {
            'landing-page' => [
                'hero' => 'required|array',
                'hero.title' => 'required|string|max:500',
                'hero.subtitle' => 'required|string|max:2000',
                'hero.primaryCta' => 'required|string|max:200',
                'hero.secondaryCta' => 'required|string|max:200',
                'hero.location' => 'required|string|max:500',
                'hero.trustLine' => 'nullable|string|max:500',
                'hero.backgroundImage' => 'nullable|array',
                'hero.backgroundImage.url' => 'nullable|string|max:2000',
                'hero.backgroundImage.alt' => 'nullable|string|max:500',
                'programs' => 'required|array|min:1',
                'programs.*.id' => 'nullable|string|max:32',
                'programs.*.name' => 'required|string|max:200',
                'programs.*.description' => 'required|string|max:5000',
                'programs.*.annualFee' => 'required|string|max:100',
                'programsSection' => 'nullable|array',
                'programsSection.eyebrow' => 'nullable|string|max:300',
                'programsSection.title' => 'nullable|string|max:500',
                'programsSection.lead' => 'nullable|string|max:2000',
                'highlights' => 'required|array|min:1',
                'highlights.*.id' => 'nullable|string|max:32',
                'highlights.*.title' => 'required|string|max:300',
                'highlights.*.description' => 'required|string|max:5000',
                'stats' => 'nullable|array',
                'stats.*.value' => 'required|string|max:100',
                'stats.*.label' => 'required|string|max:500',
                'news' => 'nullable|array',
                'news.*.id' => 'required|string|max:64',
                'news.*.title' => 'required|string|max:500',
                'news.*.excerpt' => 'required|string|max:5000',
                'news.*.date' => 'nullable|string|max:100',
                'news.*.image' => 'nullable|string|max:2000',
                'gallery' => 'nullable|array',
                'gallery.*.id' => 'required|string|max:64',
                'gallery.*.src' => 'required|string|max:2000',
                'gallery.*.alt' => 'required|string|max:500',
                'gallery.*.caption' => 'required|string|max:1000',
                'gallery.*.mediaKind' => 'nullable|string|in:image,video',
                'partners' => 'nullable|array',
                'partners.*.id' => 'required|string|max:64',
                'partners.*.name' => 'required|string|max:500',
                'partners.*.abbreviation' => 'required|string|max:16',
                'admissionSteps' => 'nullable|array',
                'admissionSteps.*.id' => 'required|string|max:64',
                'admissionSteps.*.title' => 'required|string|max:300',
                'admissionSteps.*.description' => 'required|string|max:5000',
                'articleCards' => 'nullable|array',
                'articleCards.*.id' => 'required|string|max:64',
                'articleCards.*.title' => 'required|string|max:500',
                'articleCards.*.excerpt' => 'required|string|max:5000',
                'articleCards.*.meta' => 'required|string|max:300',
                'articlesSectionLead' => 'nullable|string|max:5000',
                'articlesSectionTitle' => 'nullable|string|max:300',
                'whyKoon' => 'nullable|array',
                'whyKoon.eyebrow' => 'nullable|string|max:300',
                'whyKoon.title' => 'nullable|string|max:500',
                'whyKoon.lead' => 'nullable|string|max:5000',
                'whyKoon.visionLabel' => 'nullable|string|max:200',
                'whyKoon.visionText' => 'nullable|string|max:5000',
                'whyKoon.missionLabel' => 'nullable|string|max:200',
                'whyKoon.missionText' => 'nullable|string|max:5000',
                'whyKoon.philosophyLabel' => 'nullable|string|max:200',
                'whyKoon.philosophyText' => 'nullable|string|max:5000',
                'whyKoon.accordionSummary' => 'nullable|string|max:500',
                'whyKoon.accordionLead' => 'nullable|string|max:15000',
                'excellence' => 'nullable|array',
                'excellence.title' => 'nullable|string|max:300',
                'excellence.subtitle' => 'nullable|string|max:300',
                'excellence.body' => 'nullable|string|max:10000',
                'excellence.bullets' => 'nullable|array',
                'excellence.bullets.*' => 'string|max:1000',
                'virtualTour' => 'nullable|array',
                'virtualTour.note' => 'nullable|string|max:5000',
                'mediaTicker' => 'nullable|array',
                'mediaTicker.*' => 'string|max:500',
                'policyBullets' => 'nullable|array',
                'policyBullets.*' => 'string|max:2000',
            ],
            'about-page' => [
                'title' => 'required|string|max:300',
                'description' => 'required|string|max:10000',
                'pillars' => 'required|array|min:1',
                'pillars.*.id' => 'required|string|max:32',
                'pillars.*.title' => 'required|string|max:200',
                'pillars.*.description' => 'required|string|max:5000',
            ],
            'admissions-page' => [
                'title' => 'required|string|max:300',
                'description' => 'required|string|max:10000',
                'steps' => 'required|array|min:1',
                'steps.*.id' => 'required|string|max:32',
                'steps.*.title' => 'required|string|max:200',
                'steps.*.description' => 'required|string|max:5000',
            ],
            'contact-page' => [
                'title' => 'required|string|max:300',
                'description' => 'required|string|max:10000',
                'phone' => 'required|string|max:100',
                'email' => 'required|string|email|max:200',
                'address' => 'required|string|max:1000',
            ],
            default => throw ValidationException::withMessages(['slug' => 'Unknown content slug.']),
        };

        $validator = Validator::make($payload, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}
