<x-mail::message>
# Investment Matured

Hello {{ $userName }},

Your investment has matured and your funds have been credited to your wallet.

Reference: **{{ $reference }}**<br>
Principal: **${{ number_format($amount, 2) }}**<br>
Profit Earned: **${{ number_format($profit, 2) }}**<br>
Total Credited: **${{ number_format($amount + $profit, 2) }}**

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
