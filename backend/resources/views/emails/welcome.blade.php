<x-mail::message>
# Welcome to InvestPro!

Hello {{ $userName }},

Your account has been created successfully.

Your referral code: **{{ $referralCode }}**

Share it with friends to earn bonuses!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
