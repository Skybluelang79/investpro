<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Verify Your Email Address');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.email-verification');
    }

    public function attachments(): array
    {
        return [];
    }
}
