<?php

namespace App\Services\PaymentGateway;

interface PaymentProviderInterface
{
    public function createPayment(float $amount, string $currency, array $metadata): array;

    public function verifyPayment(string $paymentId): array;

    public function refund(string $paymentId, float $amount): array;

    public function getProviderName(): string;
}
