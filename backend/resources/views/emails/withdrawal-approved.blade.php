<x-mail::message>
# Withdrawal Approved

Hello {{ $userName }},

Your withdrawal of **${{ number_format($amount, 2) }}** has been approved and is being processed.

Reference: **{{ $reference }}**

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
