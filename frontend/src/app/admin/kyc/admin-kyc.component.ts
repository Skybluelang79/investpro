import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Kyc } from '../../core/models';

@Component({
  selector: 'app-admin-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">KYC Reviews</h1>
      <select class="input filter" [(ngModel)]="status" (change)="load()">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div class="grid-2">
      <div class="card" *ngFor="let k of kycs">
        <div class="kyc-head">
          <div>
            <div class="row-title">{{ k.user?.name }}</div>
            <div class="muted small">{{ k.user?.email }}</div>
          </div>
          <span class="badge" [ngClass]="'badge-' + statusClass(k.status)">{{ k.status }}</span>
        </div>
        <div class="kyc-body">
          <div class="info-row"><span class="muted">Type</span><span>{{ k.document_type }}</span></div>
          <div class="info-row"><span class="muted">Number</span><span class="mono">{{ k.document_number ?? '-' }}</span></div>
          <div class="info-row"><span class="muted">Submitted</span><span>{{ k.created_at | date: 'medium' }}</span></div>
          <div class="info-row" *ngIf="k.document_front"><span class="muted">Front</span><a [href]="'/storage/' + k.document_front" target="_blank" class="link">View file</a></div>
          <div class="info-row" *ngIf="k.document_back"><span class="muted">Back</span><a [href]="'/storage/' + k.document_back" target="_blank" class="link">View file</a></div>
          <div class="info-row" *ngIf="k.rejection_reason"><span class="muted">Reason</span><span class="error">{{ k.rejection_reason }}</span></div>
        </div>
        <div class="kyc-actions" *ngIf="k.status === 'pending'">
          <button class="btn btn-success btn-sm" (click)="approve(k)">Approve</button>
          <button class="btn btn-danger btn-sm" (click)="reject(k)">Reject</button>
        </div>
      </div>
    </div>

    <div class="card mt-2" *ngIf="kycs.length === 0"><div class="empty">No KYC submissions found.</div></div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
    .kyc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .row-title { font-weight: 600; }
    .info-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--card-border); font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .kyc-actions { display: flex; gap: 8px; margin-top: 12px; }
    .link { color: var(--primary); }
  `],
})
export class AdminKycComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  kycs: Kyc[] = [];
  status = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Kyc[] }>('/admin/kyc', { status: this.status }).subscribe((res) => (this.kycs = res.data));
  }

  approve(k: Kyc): void {
    this.api.post(`/admin/kyc/${k.id}/approve`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  reject(k: Kyc): void {
    const reason = prompt('Reason for rejection:');
    if (reason === null || !reason.trim()) return;
    this.api.post(`/admin/kyc/${k.id}/reject`, { reason }).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'pending';
    }
  }
}
