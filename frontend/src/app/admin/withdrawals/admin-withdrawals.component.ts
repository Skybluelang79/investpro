import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Withdrawal } from '../../core/models';

@Component({
  selector: 'app-admin-withdrawals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Withdrawals</h1>
      <select class="input filter" [(ngModel)]="status" (change)="load()">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>User</th><th>Reference</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let w of withdrawals">
            <td>
              <div>{{ w.user?.name }}</div>
              <div class="muted small">{{ w.user?.email }}</div>
            </td>
            <td class="mono small">{{ w.reference }}</td>
            <td class="mono">{{ api.money(w.amount) }}</td>
            <td class="small">{{ w.method }}</td>
            <td class="small"><pre class="json-pre">{{ w.account_details | json }}</pre></td>
            <td><span class="badge" [ngClass]="'badge-' + statusClass(w.status)">{{ w.status }}</span></td>
            <td class="small">{{ w.created_at | date: 'mediumDate' }}</td>
            <td>
              <div class="row-actions" *ngIf="w.status === 'pending'">
                <button class="btn btn-success btn-sm" (click)="approve(w)">Approve</button>
                <button class="btn btn-danger btn-sm" (click)="reject(w)">Reject</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="withdrawals.length === 0"><td colspan="8" class="empty">No withdrawals found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
    .row-actions { display: flex; gap: 6px; }
    .json-pre { margin: 0; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: pre; font-size: 11px; color: var(--text-muted); }
  `],
})
export class AdminWithdrawalsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  withdrawals: Withdrawal[] = [];
  status = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Withdrawal[] }>('/admin/withdrawals', { status: this.status, per_page: 50 }).subscribe((res) => (this.withdrawals = res.data));
  }

  approve(w: Withdrawal): void {
    this.api.post(`/admin/withdrawals/${w.id}/approve`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  reject(w: Withdrawal): void {
    const note = prompt('Reason for rejection:');
    if (note === null) return;
    this.api.post(`/admin/withdrawals/${w.id}/reject`, { note }).subscribe({
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
