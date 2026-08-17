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
    <h1 class="page-title mb-2">Manage Withdrawals</h1>

    <div class="card mb-2">
      <div class="admin-controls">
        <input type="text" class="form-control" placeholder="Search reference..." [(ngModel)]="searchRef" />
        <select class="form-control" [(ngModel)]="selectedStatus">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
        <div class="bulk-actions" *ngIf="selectedIds.size > 0">
          <span class="selected-count">{{ selectedIds.size }} selected</span>
          <button class="btn btn-xs btn-success" (click)="bulkApprove()">Approve Selected</button>
          <button class="btn btn-xs btn-danger" (click)="bulkReject()">Reject Selected</button>
          <button class="btn btn-xs btn-outline" (click)="clearSelection()">Clear</button>
        </div>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th class="checkbox-col"><input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll()" /></th>
            <th>Reference</th>
            <th>User</th>
            <th>Amount</th>
            <th>Bank</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let w of withdrawals">
            <td class="checkbox-col"><input type="checkbox" [checked]="selectedIds.has(w.id)" (change)="toggleSelect(w.id)" /></td>
            <td class="mono small">{{ w.reference }}</td>
            <td>
              <div>{{ w.user?.name }}</div>
              <div class="muted small">{{ w.user?.email }}</div>
            </td>
            <td class="mono">{{ api.money(w.amount) }}</td>
            <td class="small">{{ w.account_details?.['bank_name'] }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + w.status">{{ w.status }}</span>
            </td>
            <td class="small">{{ w.created_at | date: 'mediumDate' }}</td>
            <td>
              <button *ngIf="w.status === 'pending'" class="btn btn-xs btn-success" (click)="approve(w)">Approve</button>
              <button *ngIf="w.status === 'pending'" class="btn btn-xs btn-danger" (click)="reject(w)">Reject</button>
              <button class="btn btn-xs btn-outline" (click)="viewDetails(w)">Details</button>
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
    .admin-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .checkbox-col { width: 40px; text-align: center; }
    .bulk-actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }
    .selected-count { font-size: 13px; color: var(--accent); font-weight: 600; }
  `],
})
export class AdminWithdrawalsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  withdrawals: Withdrawal[] = [];
  searchRef = '';
  selectedStatus = '';
  selectedIds = new Set<number>();

  get allSelected(): boolean {
    return this.withdrawals.length > 0 && this.withdrawals.every(w => this.selectedIds.has(w.id));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.selectedIds.clear();
    this.api.get<{ data: Withdrawal[] }>('/admin/withdrawals', { status: this.selectedStatus, per_page: 50 }).subscribe((res) => (this.withdrawals = res.data));
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      this.withdrawals.forEach(w => this.selectedIds.add(w.id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  bulkApprove(): void {
    const ids = Array.from(this.selectedIds);
    let completed = 0;
    ids.forEach(id => {
      this.api.post<{ message: string }>(`/admin/withdrawals/${id}/approve`).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.toast.success(`Approved ${ids.length} withdrawal(s).`);
            this.load();
          }
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
      });
    });
  }

  bulkReject(): void {
    const note = prompt('Reason for rejection:');
    if (note === null) return;
    const ids = Array.from(this.selectedIds);
    let completed = 0;
    ids.forEach(id => {
      this.api.post<{ message: string }>(`/admin/withdrawals/${id}/reject`, { note }).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.toast.success(`Rejected ${ids.length} withdrawal(s).`);
            this.load();
          }
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
      });
    });
  }

  viewDetails(w: Withdrawal): void {
    this.toast.success('Withdrawal reference: ' + w.reference);
  }

  approve(w: Withdrawal): void {
    this.api.post<{ message: string }>(`/admin/withdrawals/${w.id}/approve`).subscribe({
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
    this.api.post<{ message: string }>(`/admin/withdrawals/${w.id}/reject`, { note }).subscribe({
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
