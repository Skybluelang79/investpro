<x-mail::message>
# Verify Your Email

Hello,

Use the verification code below to verify your email address:

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

This code will expire in **15 minutes**.

If you did not request this verification, please ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
