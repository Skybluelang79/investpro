import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-support-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <button class="support-btn" (click)="openPanel()" *ngIf="!isOpen">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
      <span>Support</span>
    </button>

    <!-- Chat Panel -->
    <div class="chat-panel" *ngIf="isOpen">
      <div class="chat-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Support Chat</span>
        <button class="close-btn" (click)="closePanel()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="chat-messages" #messageArea>
        <div *ngFor="let msg of messages" class="message" [class.bot]="msg.sender === 'bot'" [class.user]="msg.sender === 'user'">
          <div class="msg-bubble">{{ msg.text }}</div>
        </div>

        <div *ngIf="showQuickReplies" class="quick-replies">
          <button *ngFor="let qr of quickReplies" class="quick-reply-btn" (click)="handleQuickReply(qr)">
            {{ qr }}
          </button>
        </div>
      </div>

      <div class="chat-input">
        <input
          type="text"
          [(ngModel)]="inputText"
          placeholder="Type a message..."
          (keydown.enter)="sendMessage()"
        />
        <button class="send-btn" (click)="sendMessage()" [disabled]="!inputText.trim()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .support-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 50px;
      border: none;
      background: linear-gradient(135deg, var(--primary), var(--primary-soft));
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .support-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5);
    }

    .chat-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
      width: 360px;
      height: 480px;
      border-radius: var(--radius);
      border: 1px solid var(--card-border);
      background: var(--card);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      animation: slideUp 0.25s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      background: linear-gradient(135deg, var(--primary), var(--primary-soft));
      color: #fff;
      font-weight: 600;
      font-size: 14px;
    }

    .chat-header span { flex: 1; }

    .close-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
    }

    .message.bot { justify-content: flex-start; }
    .message.user { justify-content: flex-end; }

    .msg-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.5;
    }

    .message.bot .msg-bubble {
      background: var(--bg-soft);
      color: var(--text);
      border-bottom-left-radius: 4px;
    }

    .message.user .msg-bubble {
      background: var(--primary);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-top: 4px;
    }

    .quick-reply-btn {
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid var(--primary);
      background: transparent;
      color: var(--primary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .quick-reply-btn:hover {
      background: var(--primary);
      color: #fff;
    }

    .chat-input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid var(--card-border);
      background: var(--bg-soft);
    }

    .chat-input input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--card);
      color: var(--text);
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;
    }

    .chat-input input:focus {
      border-color: var(--primary);
    }

    .chat-input input::placeholder {
      color: var(--text-muted);
    }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: none;
      background: var(--primary);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
    }

    .send-btn:hover:not(:disabled) {
      background: var(--primary-soft);
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `]
})
export class SupportWidgetComponent {
  isOpen = false;
  inputText = '';
  showQuickReplies = true;

  messages: ChatMessage[] = [
    { sender: 'bot', text: 'Hi! How can we help you today?' }
  ];

  quickReplies = [
    'How do I invest?',
    'Withdrawal issues',
    'Account verification',
    'Contact support'
  ];

  private readonly responses: Record<string, string> = {
    'How do I invest?': 'To invest, go to Plans page, select a plan, and click Invest Now. You\'ll need to have sufficient balance in your wallet.',
    'Withdrawal issues': 'Withdrawals are processed within 24 hours. If your withdrawal is pending for longer, please contact support@investpro.com',
    'Account verification': 'Complete your KYC verification in the KYC section. You\'ll need a valid government-issued ID.',
    'Contact support': 'Email us at support@investpro.com or use the contact form on our website.'
  };

  openPanel(): void {
    this.isOpen = true;
  }

  closePanel(): void {
    this.isOpen = false;
  }

  handleQuickReply(text: string): void {
    this.messages.push({ sender: 'user', text });
    const response = this.responses[text] || 'Thanks for your message. Our team will get back to you shortly.';
    setTimeout(() => {
      this.messages.push({ sender: 'bot', text: response });
    }, 400);
    this.showQuickReplies = false;
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text) return;

    this.messages.push({ sender: 'user', text });
    this.inputText = '';

    setTimeout(() => {
      this.messages.push({
        sender: 'bot',
        text: 'Thanks for reaching out! Our support team will review your message and get back to you soon.'
      });
    }, 600);
  }
}
