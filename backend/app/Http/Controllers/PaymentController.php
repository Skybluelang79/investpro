<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Notification;
use App\Models\Transaction;
use App\Services\PaymentGateway\PaymentService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private WalletService $walletService,
    ) {}

    public function createPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'provider' => ['required', 'string', 'in:stripe,paypal'],
            'return_url' => ['nullable', 'url'],
            'cancel_url' => ['nullable', 'url'],
        ]);

        $provider = $this->paymentService->provider($validated['provider']);

        $reference = WalletService::reference('DEP');

        $metadata = [
            'user_id' => $request->user()->id,
            'reference' => $reference,
            'return_url' => $validated['return_url'] ?? null,
            'cancel_url' => $validated['cancel_url'] ?? null,
        ];

        $result = $provider->createPayment(
            $validated['amount'],
            $validated['currency'],
            $metadata,
        );

        Deposit::create([
            'user_id' => $request->user()->id,
            'reference' => $reference,
            'amount' => $validated['amount'],
            'method' => $validated['provider'],
            'account_details' => ['provider_payment_id' => $result['payment_id']],
            'status' => Deposit::STATUS_PENDING,
        ]);

        Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Payment initiated',
            'message' => "A {$validated['provider']} payment of {$validated['currency']} {$validated['amount']} has been initiated.",
            'type' => 'info',
        ]);

        return response()->json([
            'message' => 'Payment created successfully.',
            'payment' => $result,
            'reference' => $reference,
        ]);
    }

    public function verifyPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'string'],
            'provider' => ['required', 'string', 'in:stripe,paypal'],
        ]);

        $provider = $this->paymentService->provider($validated['provider']);
        $result = $provider->verifyPayment($validated['payment_id']);

        if (!($result['paid'] ?? false)) {
            return response()->json([
                'message' => 'Payment has not been completed.',
                'status' => $result['status'],
            ], 422);
        }

        $deposit = Deposit::where('method', $validated['provider'])
            ->whereJsonContains('account_details->provider_payment_id', $validated['payment_id'])
            ->first();

        if (!$deposit) {
            return response()->json(['message' => 'Deposit record not found.'], 404);
        }

        if ($deposit->status !== Deposit::STATUS_PENDING) {
            return response()->json([
                'message' => 'Deposit has already been processed.',
                'status' => $deposit->status,
            ], 422);
        }

        $deposit->update([
            'status' => Deposit::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $this->walletService->credit(
            $deposit->user_id,
            $deposit->amount,
            Transaction::TYPE_DEPOSIT,
            "Deposit via {$validated['provider']} ({$deposit->reference})",
            $deposit->reference,
        );

        Notification::create([
            'user_id' => $deposit->user_id,
            'title' => 'Deposit confirmed',
            'message' => 'Your deposit of ' . number_format($deposit->amount, 2) . ' has been confirmed and credited to your wallet.',
            'type' => 'success',
        ]);

        return response()->json([
            'message' => 'Payment verified and deposit credited.',
            'deposit' => $deposit->fresh(),
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $provider = $request->query('provider', 'stripe');

        try {
            match ($provider) {
                'stripe' => $this->handleStripeWebhook($request),
                'paypal' => $this->handlePayPalWebhook($request),
                default => throw new \InvalidArgumentException("Unsupported webhook provider: {$provider}"),
            };

            return response()->json(['status' => 'ok']);
        } catch (\Throwable $e) {
            Log::error("Webhook error [{$provider}]: " . $e->getMessage());

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    private function handleStripeWebhook(Request $request): void
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        /** @var \App\Services\PaymentGateway\StripeProvider $stripe */
        $stripe = $this->paymentService->provider('stripe');

        if (!$stripe->verifyWebhookSignature($payload, $signature)) {
            throw new \RuntimeException('Invalid Stripe webhook signature.');
        }

        $event = json_decode($payload, true);

        if ($event['type'] === 'payment_intent.succeeded') {
            $paymentIntent = $event['data']['object'];
            $reference = $paymentIntent['metadata']['reference'] ?? null;

            if ($reference) {
                $this->completeDepositByReference($reference, $paymentIntent['id'], 'stripe');
            }
        }
    }

    private function handlePayPalWebhook(Request $request): void
    {
        $payload = $request->json()->all();

        if (($payload['event_type'] ?? '') === 'PAYMENT.CAPTURE.COMPLETED') {
            $capture = $payload['resource'] ?? [];
            $customId = $capture['custom_id'] ?? null;

            if ($customId) {
                $this->completeDepositByReference($customId, $capture['id'] ?? '', 'paypal');
            }
        }
    }

    private function completeDepositByReference(string $reference, string $providerPaymentId, string $provider): void
    {
        $deposit = Deposit::where('reference', $reference)
            ->where('status', Deposit::STATUS_PENDING)
            ->first();

        if (!$deposit) {
            Log::warning("Webhook: deposit not found for reference {$reference}");
            return;
        }

        $deposit->update([
            'status' => Deposit::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $this->walletService->credit(
            $deposit->user_id,
            $deposit->amount,
            'deposit',
            "Deposit via {$provider} ({$deposit->reference})",
            $deposit->reference,
        );

        Notification::create([
            'user_id' => $deposit->user_id,
            'title' => 'Deposit confirmed',
            'message' => 'Your deposit of ' . number_format($deposit->amount, 2) . ' has been confirmed.',
            'type' => 'success',
        ]);
    }
}
