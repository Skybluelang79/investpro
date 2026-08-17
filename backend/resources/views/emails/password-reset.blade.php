<x-mail::message>
# Password Reset Code

We received a request to reset your password. Use the code below to proceed.

<x-mail::panel>
    <div style="text-align:center;padding:16px 0;">
        <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#6366f1;">{{ $code }}</span>
    </div>
</x-mail::panel>

This code expires in **15 minutes**. If you didn't request a password reset, you can safely ignore this email.

Thanks,<br/>
{{ config('app.name') }}
</x-mail::message>
