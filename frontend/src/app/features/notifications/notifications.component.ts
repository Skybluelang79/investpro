import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationItem } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Notifications</h1>
      <button class="btn btn-outline btn-sm" (click)="markAll()">Mark all as read</button>
    </div>

    <div class="card" *ngIf="notifications">
      <div *ngFor="let n of notifications.data"
           class="notif-row"
           [class.unread]="!n.is_read"
           (click)="markRead(n)">
        <div class="notif-icon" [ngClass]="'icon-' + n.type">&#128276;</div>
        <div class="notif-body">
          <div class="notif-title">{{ n.title }}</div>
          <div class="muted small">{{ n.message }}</div>
        </div>
        <div class="notif-time muted small">{{ n.created_at | date: 'medium' }}</div>
      </div>
      <div *ngIf="notifications.data.length === 0" class="empty">No notifications yet.</div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .notif-row { display: flex; gap: 14px; padding: 14px; border-bottom: 1px solid var(--card-border); cursor: pointer; border-radius: 10px; }
    .notif-row:hover { background: rgba(255,255,255,.03); }
    .notif-row.unread { background: rgba(99,102,241,.07); }
    .notif-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg); font-size: 15px; flex-shrink: 0; }
    .icon-success { background: rgba(34,197,94,.15); }
    .icon-error { background: rgba(239,68,68,.15); }
    .notif-body { flex: 1; }
    .notif-title { font-weight: 600; }
    .notif-time { white-space: nowrap; }
  `],
})
export class NotificationsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  notifications?: { data: NotificationItem[] };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: NotificationItem[] }>('/notifications').subscribe((res) => (this.notifications = res));
  }

  markRead(n: NotificationItem): void {
    if (n.is_read) return;
    this.api.post(`/notifications/${n.id}/read`).subscribe(() => {
      n.is_read = true;
    });
  }

  markAll(): void {
    this.api.post('/notifications/read-all').subscribe({
      next: () => {
        this.notifications?.data.forEach((n) => (n.is_read = true));
        this.toast.success('All notifications marked as read.');
      },
    });
  }
}
