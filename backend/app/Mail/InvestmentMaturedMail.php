<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvestmentMaturedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $reference,
        public float $amount,
        public float $profit,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Investment Matured');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.investment-matured');
    }

    public function attachments(): array
    {
        return [];
    }
}
