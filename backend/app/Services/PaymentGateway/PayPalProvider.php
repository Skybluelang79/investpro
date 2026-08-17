<?php

namespace App\Services\PaymentGateway;

use Illuminate\Support\Facades\Http;

class PayPalProvider implements PaymentProviderInterface
{
    private string $clientId;
    private string $clientSecret;
    private string $baseUrl;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id', env('PAYPAL_CLIENT_ID'));
        $this->clientSecret = config('services.paypal.client_secret', env('PAYPAL_CLIENT_SECRET'));
        $mode = config('services.paypal.mode', env('PAYPAL_MODE', 'sandbox'));
        $this->baseUrl = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private function getAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['error_description'] ?? 'PayPal authentication failed.');
        }

        $this->accessToken = $data['access_token'];

        return $this->accessToken;
    }

    public function createPayment(float $amount, string $currency, array $metadata): array
    {
        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'amount' => [
                            'currency_code' => strtoupper($currency),
                            'value' => number_format($amount, 2, '.', ''),
                        ],
                        'custom_id' => $metadata['reference'] ?? null,
                    ],
                ],
                'application_context' => [
                    'return_url' => $metadata['return_url'] ?? url('/payment/return'),
                    'cancel_url' => $metadata['cancel_url'] ?? url('/payment/cancel'),
                ],
            ]);

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['message'] ?? 'PayPal payment creation failed.');
        }

        $approveUrl = collect($data['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;

        return [
            'payment_id' => $data['id'],
            'approve_url' => $approveUrl,
            'status' => $data['status'],
            'amount' => $amount,
            'currency' => $currency,
        ];
    }

    public function verifyPayment(string $paymentId): array
    {
        $response = Http::withToken($this->getAccessToken())
            ->get("{$this->baseUrl}/v2/checkout/orders/{$paymentId}");

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['message'] ?? 'PayPal payment verification failed.');
        }

        $capturedAmount = 0;
        if (isset($data['purchase_units'][0]['payments']['captures'][0]['amount'])) {
            $capturedAmount = (float) $data['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
        }

        return [
            'payment_id' => $data['id'],
            'status' => $data['status'],
            'amount' => $capturedAmount,
            'currency' => $data['purchase_units'][0]['amount']['currency_code'] ?? 'USD',
            'paid' => $data['status'] === 'COMPLETED',
        ];
    }

    public function refund(string $paymentId, float $amount): array
    {
        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl}/v2/payments/captures/{$paymentId}/refund", [
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency_code' => 'USD',
                ],
            ]);

        $data = $response->json();

        if ($response->failed()) {
            throw new \RuntimeException($data['message'] ?? 'PayPal refund failed.');
        }

        return [
            'refund_id' => $data['id'],
            'status' => $data['status'],
            'amount' => (float) ($data['amount']['value'] ?? $amount),
        ];
    }

    public function getProviderName(): string
    {
        return 'paypal';
    }
}
