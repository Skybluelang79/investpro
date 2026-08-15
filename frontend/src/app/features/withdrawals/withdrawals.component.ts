import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Withdrawal } from '../../core/models';

@Component({
  selector: 'app-withdrawals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Withdraw Funds</h1>

    <div *ngIf="!wallet" class="loading">Loading wallet...</div>

    <ng-container *ngIf="wallet">
      <div class="grid-2">
        <div class="card">
          <h3 class="section-title mb-2">Request a withdrawal</h3>
          <p class="muted small mb-2">Available balance: <strong class="mono">{{ api.money(wallet.balance) }}</strong></p>

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
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div class="field">
              <label>Account details</label>
              <textarea class="input" rows="3" [(ngModel)]="form.account_details" name="account_details"
                placeholder='{"bank":"Bank of America","account_no":"12345678","routing":"021000021"}'></textarea>
            </div>

            <div *ngIf="kycBlocked" class="error mb-1">
              KYC verification required to withdraw.
            </div>

            <button class="btn btn-primary" type="submit" [disabled]="submitting || kycBlocked">
              {{ submitting ? 'Submitting...' : 'Request withdrawal' }}
            </button>
          </form>
        </div>

        <div class="card">
          <h3 class="section-title mb-2">Withdrawal History</h3>
          <table class="table">
            <thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let w of withdrawals">
                <td class="mono small">{{ w.reference }}</td>
                <td class="mono">{{ api.money(w.amount) }}</td>
                <td class="small">{{ w.method }}</td>
                <td><span class="badge" [ngClass]="'badge-' + statusClass(w.status)">{{ w.status }}</span></td>
                <td class="small">{{ w.created_at | date: 'mediumDate' }}</td>
              </tr>
              <tr *ngIf="withdrawals.length === 0"><td colspan="5" class="empty">No withdrawals yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
  `],
})
export class WithdrawalsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  wallet?: { balance: number };
  withdrawals: Withdrawal[] = [];
  form = { amount: null as number | null, method: 'bank_transfer', account_details: '' };
  submitting = false;
  kycBlocked = false;

  ngOnInit(): void {
    this.api.get<{ wallet: { balance: number } }>('/wallet').subscribe((res) => (this.wallet = res.wallet));
    this.api.get<{ data: Withdrawal[] }>('/withdrawals').subscribe((res) => (this.withdrawals = res.data));
    this.api.get<{ kyc: { status: string } | null }>('/kyc').subscribe((res) => {
      this.kycBlocked = res.kyc?.status !== 'approved';
    });
  }

  submit(): void {
    if (!this.form.amount || this.form.amount <= 0) return;

    let accountDetails: Record<string, unknown>;
    try {
      accountDetails = JSON.parse(this.form.account_details || '{}');
    } catch {
      this.toast.error('Account details must be valid JSON.');
      return;
    }

    this.submitting = true;
    this.api.post<{ message: string }>('/withdrawals', {
      amount: this.form.amount,
      method: this.form.method,
      account_details: accountDetails,
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.form.amount = null;
        this.submitting = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message ?? 'Withdrawal failed.');
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
