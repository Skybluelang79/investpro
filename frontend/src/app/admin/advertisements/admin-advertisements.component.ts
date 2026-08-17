import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string;
  position: string;
  ad_type: string;
  width: number | null;
  height: number | null;
  is_active: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  created_at: string;
}

@Component({
  selector: 'app-admin-advertisements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Advertisements</h1>

    <div class="card mb-2">
      <button class="btn btn-primary" (click)="showCreateForm = true">+ Create Ad</button>
    </div>

    <!-- Create/Edit Form -->
    <div class="card mb-2" *ngIf="showCreateForm">
      <h3 class="section-title mb-2">{{ editing ? 'Edit Advertisement' : 'Create Advertisement' }}</h3>
      <form (ngSubmit)="save()">
        <div class="field">
          <label>Title</label>
          <input class="input" type="text" [(ngModel)]="form.title" name="title" required />
        </div>
        <div class="field">
          <label>Description</label>
          <textarea class="input" rows="2" [(ngModel)]="form.description" name="description"></textarea>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Image URL</label>
            <input class="input" type="url" [(ngModel)]="form.image_url" name="image_url" placeholder="https://..." />
          </div>
          <div class="field">
            <label>Link URL</label>
            <input class="input" type="url" [(ngModel)]="form.link_url" name="link_url" required placeholder="https://..." />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Position</label>
            <select class="input" [(ngModel)]="form.position" name="position" required>
              <option value="hero">Hero</option>
              <option value="sidebar">Sidebar</option>
              <option value="inline">Inline</option>
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
            </select>
          </div>
          <div class="field">
            <label>Type</label>
            <select class="input" [(ngModel)]="form.ad_type" name="ad_type" required>
              <option value="banner">Banner</option>
              <option value="card">Card</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Width (px)</label>
            <input class="input" type="number" [(ngModel)]="form.width" name="width" placeholder="Auto" />
          </div>
          <div class="field">
            <label>Height (px)</label>
            <input class="input" type="number" [(ngModel)]="form.height" name="height" placeholder="Auto" />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Priority</label>
            <input class="input" type="number" [(ngModel)]="form.priority" name="priority" min="0" />
          </div>
          <div class="field">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="form.is_active" name="is_active" />
              Active
            </label>
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Starts At</label>
            <input class="input" type="datetime-local" [(ngModel)]="form.start_at" name="start_at" />
          </div>
          <div class="field">
            <label>Ends At</label>
            <input class="input" type="datetime-local" [(ngModel)]="form.end_at" name="end_at" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" (click)="cancelForm()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save Ad' }}</button>
        </div>
      </form>
    </div>

    <!-- Stats Modal -->
    <div class="card mb-2" *ngIf="statsAd">
      <h3 class="section-title mb-2">Stats: {{ statsAd.title }}</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Impressions</span>
          <span class="stat-value">{{ statsAd.impressions | number }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Clicks</span>
          <span class="stat-value">{{ statsAd.clicks | number }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">CTR</span>
          <span class="stat-value">{{ statsAd.ctr | number:'1.1-2' }}%</span>
        </div>
      </div>
      <div class="modal-actions" style="margin-top: 12px;">
        <button class="btn btn-outline" (click)="statsAd = null">Close</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div *ngIf="ads.length === 0 && !loading" class="loading">No advertisements found.</div>
      <div *ngIf="loading" class="loading">Loading advertisements...</div>
      <table class="table" *ngIf="ads.length > 0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Position</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Clicks</th>
            <th>Impressions</th>
            <th>CTR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let ad of ads">
            <td><strong>{{ ad.title }}</strong></td>
            <td>
              <span class="badge badge-info">{{ ad.ad_type }}</span>
            </td>
            <td>
              <span class="badge badge-secondary">{{ ad.position }}</span>
            </td>
            <td>
              <span class="badge" [ngClass]="ad.is_active ? 'badge-success' : 'badge-danger'">
                {{ ad.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ ad.priority }}</td>
            <td>{{ ad.clicks | number }}</td>
            <td>{{ ad.impressions | number }}</td>
            <td>{{ ad.ctr | number:'1.1-2' }}%</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs btn-outline" (click)="viewStats(ad)">Stats</button>
                <button class="btn btn-xs btn-outline" (click)="edit(ad)">Edit</button>
                <button class="btn btn-xs btn-outline" (click)="toggleActive(ad)">{{ ad.is_active ? 'Off' : 'On' }}</button>
                <button class="btn btn-xs btn-danger" (click)="delete(ad.id)">Delete</button>
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
    .loading { padding: 24px; text-align: center; color: var(--text-secondary, #94a3b8); font-size: 14px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: var(--bg-card, rgba(255, 255, 255, 0.03));
      border-radius: 8px;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
    }
    .stat-label { font-size: 12px; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--text-primary, #e2e8f0); }
    .badge-info { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
    .badge-secondary { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
  `],
})
export class AdminAdvertisementsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  ads: Advertisement[] = [];
  loading = false;
  showCreateForm = false;
  saving = false;
  editing: Advertisement | null = null;
  statsAd: Advertisement | null = null;
  form: Partial<Advertisement> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<{ advertisements: Advertisement[] }>('/admin/advertisements').subscribe({
      next: (res) => {
        this.ads = res.advertisements ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Failed to load advertisements.');
      },
    });
  }

  save(): void {
    this.saving = true;
    const payload: Record<string, unknown> = {
      ...this.form,
      start_at: this.form.start_at ? new Date(this.form.start_at as string).toISOString() : null,
      end_at: this.form.end_at ? new Date(this.form.end_at as string).toISOString() : null,
    };

    const obs = this.form.id
      ? this.api.put<{ message: string }>(`/admin/advertisements/${this.form.id}`, payload)
      : this.api.post<{ message: string }>('/admin/advertisements', payload);

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

  edit(ad: Advertisement): void {
    this.editing = ad;
    this.form = {
      ...ad,
      start_at: ad.start_at ? this.toLocalDatetime(ad.start_at) : '',
      end_at: ad.end_at ? this.toLocalDatetime(ad.end_at) : '',
    };
    this.showCreateForm = true;
    this.statsAd = null;
  }

  viewStats(ad: Advertisement): void {
    this.statsAd = ad;
    this.showCreateForm = false;
    this.editing = null;
    this.form = {};
  }

  toggleActive(ad: Advertisement): void {
    this.api.post(`/admin/advertisements/${ad.id}/toggle-active`).subscribe({
      next: () => {
        this.toast.success('Advertisement status updated.');
        this.load();
      },
    });
  }

  delete(id: number): void {
    const ad = this.ads.find((x) => x.id === id);
    if (!ad || !confirm(`Delete advertisement "${ad.title}"?`)) return;
    this.api.delete<{ message: string }>(`/admin/advertisements/${id}`).subscribe({
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
