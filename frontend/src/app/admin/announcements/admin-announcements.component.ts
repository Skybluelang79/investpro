import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface Announcement {
  id: number;
  title: string;
  message: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Announcements</h1>

    <div class="card mb-2">
      <button class="btn btn-primary" (click)="showCreateForm = true">+ Create Announcement</button>
    </div>

    <!-- Create/Edit Inline Form -->
    <div class="card mb-2" *ngIf="showCreateForm">
      <h3 class="section-title mb-2">{{ editing ? 'Edit Announcement' : 'Create Announcement' }}</h3>
      <form (ngSubmit)="save()">
        <div class="field">
          <label>Title</label>
          <input class="input" type="text" [(ngModel)]="form.title" name="title" required />
        </div>
        <div class="field">
          <label>Message</label>
          <textarea class="input" rows="3" [(ngModel)]="form.message" name="message" required></textarea>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Starts At</label>
            <input class="input" type="datetime-local" [(ngModel)]="form.starts_at" name="starts_at" />
          </div>
          <div class="field">
            <label>Ends At</label>
            <input class="input" type="datetime-local" [(ngModel)]="form.ends_at" name="ends_at" />
          </div>
        </div>
        <div class="field">
          <label class="toggle-label">
            <input type="checkbox" [(ngModel)]="form.is_active" name="is_active" />
            Active
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" (click)="cancelForm()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save Announcement' }}</button>
        </div>
      </form>
    </div>

    <!-- Announcements List -->
    <div class="card">
      <div *ngIf="announcements.length === 0" class="loading">Loading announcements...</div>
      <table class="table" *ngIf="announcements.length > 0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Message</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of announcements">
            <td><strong>{{ a.title }}</strong></td>
            <td class="small">{{ a.message.length > 80 ? a.message.substring(0, 80) + '...' : a.message }}</td>
            <td>
              <span class="badge" [ngClass]="a.is_active ? 'badge-success' : 'badge-danger'">
                {{ a.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="small">{{ a.created_at | date:'medium' }}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs btn-outline" (click)="edit(a)">Edit</button>
                <button class="btn btn-xs btn-outline" (click)="toggleActive(a)">{{ a.is_active ? 'Deactivate' : 'Activate' }}</button>
                <button class="btn btn-xs btn-danger" (click)="delete(a.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
    .row-actions { display: flex; gap: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
    .toggle-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
    .toggle-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary, #6c5ce7); }
  `],
})
export class AdminAnnouncementsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  announcements: Announcement[] = [];
  showCreateForm = false;
  saving = false;
  editing: Announcement | null = null;
  form: Partial<Announcement> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ announcements: Announcement[] }>('/admin/announcements').subscribe({
      next: (res) => (this.announcements = res.announcements),
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to load announcements.'),
    });
  }

  save(): void {
    this.saving = true;
    const payload = {
      ...this.form,
      starts_at: this.form.starts_at ? new Date(this.form.starts_at as string).toISOString() : null,
      ends_at: this.form.ends_at ? new Date(this.form.ends_at as string).toISOString() : null,
    };
    const obs = this.form.id
      ? this.api.put<{ message: string }>(`/admin/announcements/${this.form.id}`, payload)
      : this.api.post<{ message: string }>('/admin/announcements', payload);

    obs.subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.saving = false;
        this.showCreateForm = false;
        this.editing = null;
        this.form = {};
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Save failed.');
      },
    });
  }

  edit(announcement: Announcement): void {
    this.editing = announcement;
    this.form = {
      ...announcement,
      starts_at: announcement.starts_at ? this.toLocalDatetime(announcement.starts_at) : '',
      ends_at: announcement.ends_at ? this.toLocalDatetime(announcement.ends_at) : '',
    };
    this.showCreateForm = true;
  }

  toggleActive(a: Announcement): void {
    this.api.post(`/admin/announcements/${a.id}/toggle-active`).subscribe({
      next: () => {
        this.toast.success('Announcement status updated.');
        this.load();
      },
    });
  }

  delete(id: number): void {
    const a = this.announcements.find((x) => x.id === id);
    if (!a || !confirm(`Delete announcement "${a.title}"?`)) return;
    this.api.delete<{ message: string }>(`/admin/announcements/${id}`).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Delete failed.'),
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editing = null;
    this.form = {};
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
