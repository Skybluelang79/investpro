<?php

namespace App\Services\PaymentGateway;

use Illuminate\Support\Facades\Http;

class StripeProvider implements PaymentProviderInterface
{
    private string $secretKey;
    private string $webhookSecret;
    private string $baseUrl = 'https://api.stripe.com/v1';

    public function __construct()
    {
        $this->secretKey = config('services.stripe.secret', env('STRIPE_SECRET'));
        $this->webhookSecret = config('services.stripe.webhook_secret', env('STRIPE_WEBHOOK_SECRET'));
    }

    public function createPayment(float $amount, string $currency, array $metadata): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post("{$this->baseUrl}/payment_intents", [
                'amount' => (int) ($amount * 100),
                'currency' => strtolower($currency),
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['error']['message'] ?? 'Stripe payment creation failed.');
        }

        return [
            'payment_id' => $data['id'],
            'client_secret' => $data['client_secret'],
            'status' => $data['status'],
            'amount' => $amount,
            'currency' => $currency,
        ];
    }

    public function verifyPayment(string $paymentId): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get("{$this->baseUrl}/payment_intents/{$paymentId}");

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['error']['message'] ?? 'Stripe payment verification failed.');
        }

        return [
            'payment_id' => $data['id'],
            'status' => $data['status'],
            'amount' => $data['amount'] / 100,
            'currency' => strtoupper($data['currency']),
            'metadata' => $data['metadata'] ?? [],
            'paid' => $data['status'] === 'succeeded',
        ];
    }

    public function refund(string $paymentId, float $amount): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post("{$this->baseUrl}/refunds", [
                'payment_intent' => $paymentId,
                'amount' => (int) ($amount * 100),
            ]);

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['error']['message'] ?? 'Stripe refund failed.');
        }

        return [
            'refund_id' => $data['id'],
            'status' => $data['status'],
            'amount' => $data['amount'] / 100,
        ];
    }

    public function getProviderName(): string
    {
        return 'stripe';
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $elements = explode(',', $signature);
        $timestamp = null;
        $signedHeader = null;

        foreach ($elements as $element) {
            $parts = explode('=', $element, 2);
            if ($parts[0] === 't') {
                $timestamp = $parts[1];
            }
            if ($parts[0] === 'v1') {
                $signedHeader = $parts[1];
            }
        }

        if (!$timestamp || !$signedHeader) {
            return false;
        }

        $signedPayload = "{$timestamp}.{$payload}";
        $expectedSignature = hash_hmac('sha256', $signedPayload, $this->webhookSecret);

        return hash_equals($expectedSignature, $signedHeader);
    }
}
