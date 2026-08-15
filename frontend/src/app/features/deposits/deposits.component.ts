import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Deposit } from '../../core/models';

@Component({
  selector: 'app-deposits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Deposit Funds</h1>

    <div class="grid-2">
      <div class="card">
        <h3 class="section-title mb-2">Make a deposit</h3>
        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Amount (USD)</label>
            <input class="input mono" type="number" [(ngModel)]="form.amount" name="amount" required min="1" />
          </div>
          <div class="field">
            <label>Method</label>
            <select class="input" [(ngModel)]="form.method" name="method">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto_usdt">Crypto (USDT)</option>
              <option value="card">Credit / Debit Card</option>
            </select>
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="submitting">
            {{ submitting ? 'Submitting...' : 'Submit deposit' }}
          </button>
        </form>
        <p class="muted small mt-2">Deposits are reviewed by an administrator before being credited to your wallet.</p>
      </div>

      <div class="card">
        <h3 class="section-title mb-2">Deposit History</h3>
        <table class="table">
          <thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of deposits">
              <td class="mono small">{{ d.reference }}</td>
              <td class="mono">{{ api.money(d.amount) }}</td>
              <td class="small">{{ d.method }}</td>
              <td><span class="badge" [ngClass]="'badge-' + statusClass(d.status)">{{ d.status }}</span></td>
              <td class="small">{{ d.created_at | date: 'mediumDate' }}</td>
            </tr>
            <tr *ngIf="deposits.length === 0"><td colspan="5" class="empty">No deposits yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
  `],
})
export class DepositsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  form = { amount: null as number | null, method: 'bank_transfer' };
  deposits: Deposit[] = [];
  submitting = false;

  ngOnInit(): void {
    this.api.get<{ data: Deposit[] }>('/deposits').subscribe((res) => (this.deposits = res.data));
  }

  submit(): void {
    if (!this.form.amount || this.form.amount <= 0) return;
    this.submitting = true;

    this.api.post<{ message: string }>('/deposits', this.form).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.form.amount = null;
        this.submitting = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message ?? 'Deposit failed.');
      },
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
