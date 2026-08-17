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
    <h1 class="page-title mb-2">Manage Deposits</h1>

    <div class="card mb-2">
      <div class="admin-controls">
        <input type="text" class="form-control" placeholder="Search reference..." [(ngModel)]="searchRef" />
        <select class="form-control" [(ngModel)]="selectedStatus">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
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
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of deposits">
            <td class="checkbox-col"><input type="checkbox" [checked]="selectedIds.has(d.id)" (change)="toggleSelect(d.id)" /></td>
            <td class="mono small">{{ d.reference }}</td>
            <td>
              <div>{{ d.user?.name }}</div>
              <div class="muted small">{{ d.user?.email }}</div>
            </td>
            <td class="mono">{{ api.money(d.amount) }}</td>
            <td>{{ d.method | titlecase }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + d.status">{{ d.status }}</span>
            </td>
            <td class="small">{{ d.created_at | date: 'mediumDate' }}</td>
            <td>
              <button *ngIf="d.status === 'pending'" class="btn btn-xs btn-success" (click)="approve(d)">Approve</button>
              <button *ngIf="d.status === 'pending'" class="btn btn-xs btn-danger" (click)="reject(d)">Reject</button>
              <button class="btn btn-xs btn-outline" (click)="viewDetails(d)">Details</button>
            </td>
          </tr>
          <tr *ngIf="deposits.length === 0"><td colspan="8" class="empty">No deposits found.</td></tr>
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
export class AdminDepositsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  deposits: Deposit[] = [];
  searchRef = '';
  selectedStatus = '';
  selectedIds = new Set<number>();

  get allSelected(): boolean {
    return this.deposits.length > 0 && this.deposits.every(d => this.selectedIds.has(d.id));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.selectedIds.clear();
    this.api.get<{ data: Deposit[] }>('/admin/deposits', { status: this.selectedStatus, per_page: 50 }).subscribe((res) => (this.deposits = res.data));
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
      this.deposits.forEach(d => this.selectedIds.add(d.id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  bulkApprove(): void {
    const ids = Array.from(this.selectedIds);
    let completed = 0;
    ids.forEach(id => {
      this.api.post<{ message: string }>(`/admin/deposits/${id}/approve`).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.toast.success(`Approved ${ids.length} deposit(s).`);
            this.load();
          }
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
      });
    });
  }

  bulkReject(): void {
    const note = prompt('Reason for rejection (optional):');
    if (note === null) return;
    const ids = Array.from(this.selectedIds);
    let completed = 0;
    ids.forEach(id => {
      this.api.post<{ message: string }>(`/admin/deposits/${id}/reject`, { note }).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.toast.success(`Rejected ${ids.length} deposit(s).`);
            this.load();
          }
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
      });
    });
  }

  viewDetails(d: Deposit): void {
    this.toast.success('Deposit reference: ' + d.reference);
  }

  approve(d: Deposit): void {
    this.api.post<{ message: string }>(`/admin/deposits/${d.id}/approve`).subscribe({
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
    this.api.post<{ message: string }>(`/admin/deposits/${d.id}/reject`, { note }).subscribe({
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
