<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $email,
        public string $code,
    ) {}

    public function build()
    {
        return $this->subject('Your Password Reset Code')
            ->markdown('emails.password-reset');
    }
}
