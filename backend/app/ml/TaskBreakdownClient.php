<?php

namespace App\ml;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskBreakdownClient
{
    /**
     * Call the Google Gemini API to generate structured tasks from a client brief.
     *
     * @param string $brief
     * @return array
     */
    public static function generateTasks(string $brief): array
    {
        $apiKey = trim(config('services.llm.api_key', ''));
        $configuredModel = trim(config('services.llm.model', 'gemini-2.5-flash'));
        $timeoutMs = config('services.llm.timeout_ms', 10000);
        $timeoutSeconds = intval($timeoutMs) / 1000;

        if (empty($apiKey) || $apiKey === 'change-me') {
            Log::warning('Gemini API key is not configured.');
            return [
                'success' => false,
                'error' => 'API Key for LLM provider is not configured. Please check your .env file.'
            ];
        }

        // Clean model name if user included 'models/' prefix
        if (str_starts_with($configuredModel, 'models/')) {
            $configuredModel = substr($configuredModel, 7);
        }

        // Candidate models for fallback sequence
        $modelsToTry = array_values(array_unique(array_filter([
            $configuredModel,
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
        ])));

        $prompt = "You are a professional project manager and software architect. " .
                  "Your task is to break down the following client project brief into a list of tasks. " .
                  "Group them into categories: 'frontend', 'backend', 'design', or 'QA'. " .
                  "Provide a clear title, description, and rough estimated effort (e.g. '2 days', '5 days') for each task.\n\n" .
                  "Client Brief:\n{$brief}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'tasks' => [
                            'type' => 'ARRAY',
                            'items' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'title' => [
                                        'type' => 'STRING',
                                        'description' => 'A short, concise, and professional title for the task.'
                                    ],
                                    'description' => [
                                        'type' => 'STRING',
                                        'description' => 'Detailed task description explaining what needs to be done.'
                                    ],
                                    'category' => [
                                        'type' => 'STRING',
                                        'enum' => ['frontend', 'backend', 'design', 'QA'],
                                        'description' => 'The category of the task.'
                                    ],
                                    'estimated_effort' => [
                                        'type' => 'STRING',
                                        'description' => 'Rough effort estimate, e.g. "2 days", "5 days".'
                                    ]
                                ],
                                'required' => ['title', 'description', 'category', 'estimated_effort']
                            ]
                        ]
                    ],
                    'required' => ['tasks']
                ]
            ]
        ];

        $lastError = '';

        foreach ($modelsToTry as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

            try {
                // Pass key via both header (required by AQ... keys) and query string
                $response = Http::timeout($timeoutSeconds)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                        'X-goog-api-key' => $apiKey,
                    ])
                    ->post($url, $payload);

                if ($response->successful()) {
                    $result = $response->json();
                    $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    
                    if (!empty($text)) {
                        $textClean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($text));
                        $decoded = json_decode($textClean, true);
                        if (isset($decoded['tasks']) && is_array($decoded['tasks'])) {
                            return [
                                'success' => true,
                                'tasks' => $decoded['tasks'],
                                'model_used' => $model
                            ];
                        }
                    }

                    // Fallback without strict responseSchema if output text was empty or unparseable
                    $fallbackPayload = [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'text' => $prompt . "\n\nReturn JSON in format: {\"tasks\": [{\"title\": \"...\", \"description\": \"...\", \"category\": \"frontend|backend|design|QA\", \"estimated_effort\": \"...\"}]}"
                                    ]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json'
                        ]
                    ];
                    
                    $retryRes = Http::timeout($timeoutSeconds)
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'x-goog-api-key' => $apiKey,
                        ])
                        ->post($url, $fallbackPayload);
                        
                    if ($retryRes->successful()) {
                        $retryResult = $retryRes->json();
                        $text = $retryResult['candidates'][0]['content']['parts'][0]['text'] ?? '';
                        if (!empty($text)) {
                            $textClean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($text));
                            $decoded = json_decode($textClean, true);
                            if (isset($decoded['tasks']) && is_array($decoded['tasks'])) {
                                return [
                                    'success' => true,
                                    'tasks' => $decoded['tasks'],
                                    'model_used' => $model
                                ];
                            }
                        }
                    }
                }

                $errBody = $response->json()['error']['message'] ?? $response->body();
                $lastError = "Model '{$model}' returned HTTP {$response->status()}: {$errBody}";
                Log::warning("Gemini model '{$model}' failed (HTTP {$response->status()}). Trying next model...");

            } catch (\Exception $e) {
                $lastError = 'Exception: ' . $e->getMessage();
                Log::warning("Gemini exception on model '{$model}': " . $e->getMessage());
            }
        }

        return [
            'success' => false,
            'error' => "All Gemini model attempts failed. Last error: {$lastError}"
        ];
    }
}
