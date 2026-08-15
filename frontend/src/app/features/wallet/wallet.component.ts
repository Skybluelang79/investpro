import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Wallet } from '../../core/models';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title mb-2">My Wallet</h1>

    <div *ngIf="!wallet" class="loading">Loading wallet...</div>

    <ng-container *ngIf="wallet">
      <div class="grid-2">
        <div class="card wallet-card">
          <div class="muted small">Available Balance</div>
          <div class="balance mono">{{ api.money(wallet.balance) }}</div>
        </div>
        <div class="card">
          <div class="muted small">Bonus Balance</div>
          <div class="balance mono">{{ api.money(wallet.bonus) }}</div>
        </div>
      </div>

      <div class="mt-2 card">
        <h3 class="section-title mb-2">Quick Actions</h3>
        <div class="quick-actions">
          <a routerLink="/deposits" class="btn btn-primary">+ Deposit funds</a>
          <a routerLink="/withdrawals" class="btn btn-outline">- Withdraw</a>
          <a routerLink="/investments" class="btn btn-outline">Invest</a>
        </div>
      </div>

      <div class="mt-2">
        <h3 class="section-title mb-1">Recent Transactions</h3>
        <div class="card">
          <div *ngFor="let tx of transactions" class="tx-row">
            <div>
              <div class="tx-title">{{ tx.description ?? tx.type }}</div>
              <div class="muted small">{{ tx.created_at | date: 'medium' }}</div>
            </div>
            <div [class.amount-positive]="tx.amount > 0" [class.amount-negative]="tx.amount < 0" class="mono">
              {{ tx.amount > 0 ? '+' : '' }}{{ api.money(tx.amount) }}
            </div>
          </div>
          <div *ngIf="transactions.length === 0" class="empty">No transactions yet.</div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .wallet-card { display: flex; flex-direction: column; justify-content: center; }
    .balance { font-size: 32px; font-weight: 800; margin-top: 6px; }
    .section-title { font-size: 15px; font-weight: 700; }
    .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .tx-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border); }
    .tx-row:last-child { border-bottom: none; }
    .tx-title { font-weight: 600; text-transform: capitalize; }
  `],
})
export class WalletComponent {
  api = inject(ApiService);
  wallet?: Wallet;
  transactions: { id: number; type: string; amount: number; description?: string; created_at?: string }[] = [];

  ngOnInit(): void {
    this.api.get<{ wallet: Wallet }>('/wallet').subscribe((res) => (this.wallet = res.wallet));
    this.api.get<{ data: { id: number; type: string; amount: number; description?: string; created_at?: string }[] }>('/transactions?per_page=6').subscribe((res) => (this.transactions = res.data));
  }
}
