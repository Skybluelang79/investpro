<x-mail::message>
# Deposit Confirmed

Hello {{ $userName }},

Your deposit of **${{ number_format($amount, 2) }}** has been confirmed.

Reference: **{{ $reference }}**

The funds have been credited to your wallet.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
