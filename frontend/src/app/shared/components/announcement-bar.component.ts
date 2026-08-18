import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

interface Announcement {
  id: number;
  title: string;
  message: string;
  is_active: boolean;
}

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="announcement-bar" *ngIf="!dismissed && announcement">
      <div class="announcement-content">
        <span class="announcement-text">
          <strong *ngIf="announcement.title">{{ announcement.title }}:</strong>
          {{ announcement.message }}
        </span>
        <button class="announcement-close" (click)="dismiss()" aria-label="Close announcement">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .announcement-bar {
      width: 100%;
      background: linear-gradient(135deg, var(--color-primary, #2563eb), var(--color-secondary, #7c3aed));
      color: #ffffff;
      padding: 12px 24px;
      box-sizing: border-box;
      position: relative;
      z-index: 100;
    }

    .announcement-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .announcement-text {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-align: center;
      flex: 1;
    }

    .announcement-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 22px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .announcement-close:hover {
      opacity: 1;
    }
  `]
})
export class AnnouncementBarComponent implements OnInit {
  private api = inject(ApiService);

  announcement: Announcement | null = null;
  dismissed = false;

  private readonly STORAGE_KEY = 'investpro_announcement_dismissed';

  ngOnInit(): void {
    this.dismissed = localStorage.getItem(this.STORAGE_KEY) === 'true';
    if (!this.dismissed) {
      this.fetchLatest();
    }
  }

  dismiss(): void {
    this.dismissed = true;
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  private fetchLatest(): void {
    this.api.get<{ announcements: Announcement[] }>('/announcements').subscribe({
      next: (res) => {
        const active = res.announcements ?? [];
        if (active.length > 0) {
          this.announcement = active[0];
        }
      },
      error: () => {},
    });
  }
}
