<?php

namespace App\Services\PaymentGateway;

class PaymentService
{
    private array $providers = [];

    public function __construct()
    {
        $this->providers['stripe'] = new StripeProvider();
        $this->providers['paypal'] = new PayPalProvider();
    }

    public function provider(string $name): PaymentProviderInterface
    {
        if (!isset($this->providers[$name])) {
            throw new \InvalidArgumentException("Payment provider [{$name}] not supported.");
        }

        return $this->providers[$name];
    }

    public function supportedProviders(): array
    {
        return array_keys($this->providers);
    }
}
