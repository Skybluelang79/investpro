<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KycApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'KYC Verified');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.kyc-approved');
    }

    public function attachments(): array
    {
        return [];
    }
}
