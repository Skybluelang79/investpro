<x-mail::message>
# KYC Rejected

Hello {{ $userName }},

Your identity verification (KYC) has been rejected.

Reason: {{ $reason }}

Please review the requirements and resubmit your documents.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
