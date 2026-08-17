<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WithdrawalRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public float $amount,
        public string $reference,
        public string $reason,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Withdrawal Rejected');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.withdrawal-rejected');
    }

    public function attachments(): array
    {
        return [];
    }
}
