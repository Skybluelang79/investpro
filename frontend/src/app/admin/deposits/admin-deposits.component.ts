import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Deposit } from '../../core/models';

@Component({
  selector: 'app-admin-deposits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Deposits</h1>
      <select class="input filter" [(ngModel)]="status" (change)="load()">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>User</th><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of deposits">
            <td>
              <div>{{ d.user?.name }}</div>
              <div class="muted small">{{ d.user?.email }}</div>
            </td>
            <td class="mono small">{{ d.reference }}</td>
            <td class="mono">{{ api.money(d.amount) }}</td>
            <td class="small">{{ d.method }}</td>
            <td><span class="badge" [ngClass]="'badge-' + statusClass(d.status)">{{ d.status }}</span></td>
            <td class="small">{{ d.created_at | date: 'mediumDate' }}</td>
            <td>
              <div class="row-actions" *ngIf="d.status === 'pending'">
                <button class="btn btn-success btn-sm" (click)="approve(d)">Approve</button>
                <button class="btn btn-danger btn-sm" (click)="reject(d)">Reject</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="deposits.length === 0"><td colspan="7" class="empty">No deposits found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
    .row-actions { display: flex; gap: 6px; }
  `],
})
export class AdminDepositsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  deposits: Deposit[] = [];
  status = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Deposit[] }>('/admin/deposits', { status: this.status, per_page: 50 }).subscribe((res) => (this.deposits = res.data));
  }

  approve(d: Deposit): void {
    this.api.post(`/admin/deposits/${d.id}/approve`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  reject(d: Deposit): void {
    const note = prompt('Reason for rejection (optional):');
    if (note === null) return;
    this.api.post(`/admin/deposits/${d.id}/reject`, { note }).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'pending';
    }
  }
}
