<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public float $amount,
        public string $reference,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Deposit Confirmed');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.deposit-confirmed');
    }

    public function attachments(): array
    {
        return [];
    }
}
