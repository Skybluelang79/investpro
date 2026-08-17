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
    <h1 class="page-title mb-2">KYC Verification Management</h1>

    <div class="card mb-2">
      <div class="admin-controls">
        <input type="text" class="form-control" placeholder="Search user..." [(ngModel)]="searchTerm" />
        <select class="form-control" [(ngModel)]="selectedStatus">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let k of kycs">
            <td>
              <div>{{ k.user?.name }}</div>
              <div class="muted small">{{ k.user?.email }}</div>
            </td>
            <td>{{ k.document_type | titlecase }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + k.status">{{ k.status }}</span>
            </td>
            <td class="small">{{ k.created_at | date: 'mediumDate' }}</td>
            <td>
              <button *ngIf="k.status === 'pending'" class="btn btn-xs btn-success" (click)="approve(k)">Approve</button>
              <button *ngIf="k.status === 'pending'" class="btn btn-xs btn-danger" (click)="reject(k)">Reject</button>
              <button class="btn btn-xs btn-outline" (click)="viewDocuments(k)">View Documents</button>
            </td>
          </tr>
          <tr *ngIf="kycs.length === 0"><td colspan="5" class="empty">No KYC submissions found.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>KYC Documents</h3>
          <button class="btn btn-xs btn-outline modal-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body" *ngIf="selectedKyc">
          <div class="doc-info">
            <div class="doc-row"><span class="doc-label">User:</span> {{ selectedKyc.user?.name }} ({{ selectedKyc.user?.email }})</div>
            <div class="doc-row"><span class="doc-label">Document Type:</span> {{ selectedKyc.document_type | titlecase }}</div>
            <div class="doc-row" *ngIf="selectedKyc.document_number"><span class="doc-label">Document Number:</span> {{ selectedKyc.document_number }}</div>
            <div class="doc-row"><span class="doc-label">Status:</span> <span class="badge" [ngClass]="'badge-' + selectedKyc.status">{{ selectedKyc.status }}</span></div>
          </div>
          <div class="doc-images">
            <div class="doc-image-block" *ngIf="selectedKyc.document_front">
              <div class="doc-image-label">Front</div>
              <img [src]="selectedKyc.document_front" alt="Document Front" class="doc-image" />
            </div>
            <div class="doc-image-block" *ngIf="selectedKyc.document_back">
              <div class="doc-image-label">Back</div>
              <img [src]="selectedKyc.document_back" alt="Document Back" class="doc-image" />
            </div>
            <div class="no-docs" *ngIf="!selectedKyc.document_front && !selectedKyc.document_back">
              No document images uploaded.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
    .admin-controls { display: flex; gap: 10px; flex-wrap: wrap; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: var(--card-bg, #1a1a2e); border: 1px solid var(--border, #333);
      border-radius: 10px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid var(--border, #333);
    }
    .modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
    .modal-close { font-size: 18px; padding: 2px 8px; }
    .modal-body { padding: 20px; }
    .doc-info { margin-bottom: 20px; }
    .doc-row { margin-bottom: 8px; font-size: 14px; }
    .doc-label { color: var(--text-muted, #aaa); font-weight: 600; margin-right: 6px; }
    .doc-images { display: flex; gap: 16px; flex-wrap: wrap; }
    .doc-image-block { flex: 1; min-width: 250px; }
    .doc-image-label { font-size: 13px; font-weight: 600; color: var(--text-muted, #aaa); margin-bottom: 6px; }
    .doc-image { width: 100%; border-radius: 8px; border: 1px solid var(--border, #333); }
    .no-docs { color: var(--text-muted, #aaa); font-size: 14px; }
  `],
})
export class AdminKycComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  kycs: Kyc[] = [];
  searchTerm = '';
  selectedStatus = '';
  selectedKyc: any = null;
  showModal = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Kyc[] }>('/admin/kyc', { status: this.selectedStatus }).subscribe((res) => (this.kycs = res.data));
  }

  viewDocuments(k: Kyc): void {
    this.selectedKyc = k;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedKyc = null;
  }

  approve(k: Kyc): void {
    this.api.post<{ message: string }>(`/admin/kyc/${k.id}/approve`).subscribe({
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
    this.api.post<{ message: string }>(`/admin/kyc/${k.id}/reject`, { reason }).subscribe({
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
