import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Kyc } from '../../core/models';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Identity Verification (KYC)</h1>

    <div *ngIf="!kyc && loading" class="loading">Loading...</div>

    <div class="card" *ngIf="kyc && kyc.status !== 'approved'">
      <h3 class="section-title mb-2">Submit your documents</h3>

      <form (ngSubmit)="submit()">
        <div class="field">
          <label>Document type</label>
          <select class="input" [(ngModel)]="form.document_type" name="document_type">
            <option value="passport">Passport</option>
            <option value="id_card">National ID Card</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>
        <div class="field">
          <label>Document number</label>
          <input class="input" type="text" [(ngModel)]="form.document_number" name="document_number" />
        </div>
        <div class="field">
          <label>Front of document</label>
          <input class="input" type="file" (change)="onFront($event)" accept="image/*" />
        </div>
        <div class="field">
          <label>Back of document</label>
          <input class="input" type="file" (change)="onBack($event)" accept="image/*" />
        </div>
        <button class="btn btn-primary" type="submit" [disabled]="submitting">
          {{ submitting ? 'Submitting...' : 'Submit for review' }}
        </button>
      </form>
    </div>

    <div class="card status-card" *ngIf="kyc">
      <div class="muted small">Verification status</div>
      <div class="mt-1">
        <span class="badge" [ngClass]="'badge-' + statusClass(kyc.status)">
          {{ kyc.status | uppercase }}
        </span>
      </div>
      <p *ngIf="kyc.status === 'rejected' && kyc.rejection_reason" class="error mt-1">
        Reason: {{ kyc.rejection_reason }}
      </p>
      <p *ngIf="kyc.status === 'approved'" class="percent-up mt-1">
        Verified on {{ kyc.verified_at | date: 'mediumDate' }}
      </p>
      <p *ngIf="kyc.status === 'pending'" class="muted small mt-1">
        Your documents are under review. This usually takes 1-2 business days.
      </p>
    </div>

    <div class="card mt-2" *ngIf="!kyc && !loading">
      <p class="muted">You have not submitted any KYC documents yet. Complete KYC to enable withdrawals.</p>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
    .status-card { max-width: 420px; }
  `],
})
export class KycComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  kyc?: Kyc | null;
  loading = true;
  submitting = false;
  form = { document_type: 'passport', document_number: '' };
  front?: File;
  back?: File;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<{ kyc: Kyc | null }>('/kyc').subscribe({
      next: (res) => {
        this.kyc = res.kyc;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onFront(event: Event): void {
    this.front = (event.target as HTMLInputElement).files?.[0];
  }

  onBack(event: Event): void {
    this.back = (event.target as HTMLInputElement).files?.[0];
  }

  submit(): void {
    const form = new FormData();
    form.append('document_type', this.form.document_type);
    form.append('document_number', this.form.document_number);
    if (this.front) form.append('document_front', this.front);
    if (this.back) form.append('document_back', this.back);

    this.submitting = true;
    this.api.upload<{ message: string }>('/kyc', form).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.submitting = false;
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message ?? 'KYC submission failed.');
      },
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
