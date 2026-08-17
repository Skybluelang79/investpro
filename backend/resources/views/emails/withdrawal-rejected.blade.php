<x-mail::message>
# Withdrawal Rejected

Hello {{ $userName }},

Your withdrawal of **${{ number_format($amount, 2) }}** has been rejected.

Reference: **{{ $reference }}**

Reason: {{ $reason }}

If you believe this is an error, please contact support.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
