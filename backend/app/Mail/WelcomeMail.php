<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $referralCode,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome to InvestPro');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.welcome');
    }

    public function attachments(): array
    {
        return [];
    }
}
