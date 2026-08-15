import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Transaction } from '../../core/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <div>
        <h1 class="page-title">Transactions</h1>
        <div class="muted small">Filter by type, search text, or date range</div>
      </div>
      <div class="filters-row">
        <input class="input" type="search" placeholder="Search description or reference" [(ngModel)]="search" (keyup.enter)="load()" />
        <select class="input filter" [(ngModel)]="type" (change)="load()">
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="investment">Investment</option>
          <option value="profit">Profit</option>
          <option value="return">Return</option>
          <option value="bonus">Bonus</option>
        </select>
      </div>
    </div>

    <div class="card mb-2">
      <div class="grid-3 gap-2">
        <label class="block">
          <span class="small muted">From</span>
          <input class="input" type="date" [(ngModel)]="from" (change)="load()" />
        </label>
        <label class="block">
          <span class="small muted">To</span>
          <input class="input" type="date" [(ngModel)]="to" (change)="load()" />
        </label>
        <div class="block">
          <span class="small muted">Presets</span>
          <div class="button-group mt-1">
            <button class="btn btn-outline btn-sm" type="button" (click)="setDatePreset('7')">7d</button>
            <button class="btn btn-outline btn-sm" type="button" (click)="setDatePreset('30')">30d</button>
            <button class="btn btn-outline btn-sm" type="button" (click)="setDatePreset('90')">90d</button>
            <button class="btn btn-outline btn-sm" type="button" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid-2 mb-2" *ngIf="type === 'bonus'">
        <div class="card stat">
          <div class="stat-label muted">Bonus total</div>
          <div class="stat-value mono">{{ api.money(bonusTotal) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Bonus count</div>
          <div class="stat-value">{{ bonusCount }}</div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr><th>Type</th><th>Description</th><th>Amount</th><th>Balance</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let tx of transactions">
            <td><span class="badge" [ngClass]="'badge-' + typeClass(tx.type)">{{ tx.type }}</span></td>
            <td class="small">{{ tx.description ?? tx.reference ?? '-' }}</td>
            <td [class.amount-positive]="tx.amount > 0" [class.amount-negative]="tx.amount < 0" class="mono">
              {{ tx.amount > 0 ? '+' : '' }}{{ api.money(tx.amount) }}
            </td>
            <td class="mono small">{{ api.money(tx.balance_after) }}</td>
            <td class="small">{{ tx.status }}</td>
            <td class="small">{{ tx.created_at | date: 'medium' }}</td>
          </tr>
          <tr *ngIf="transactions.length === 0"><td colspan="6" class="empty">No transactions found.</td></tr>
        </tbody>
      </table>

      <div class="pager" *ngIf="meta.total > 0">
        <button class="btn btn-outline btn-sm" [disabled]="page <= 1" (click)="go(page - 1)">&laquo; Prev</button>
        <span class="muted small">Page {{ page }} of {{ meta.last_page }}</span>
        <button class="btn btn-outline btn-sm" [disabled]="page >= meta.last_page" (click)="go(page + 1)">Next &raquo;</button>
      </div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filters-row .input { min-width: 240px; max-width: 320px; }
    .filter { width: 180px; }
    .button-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; }
  `],
})
export class TransactionsComponent {
  api = inject(ApiService);

  transactions: Transaction[] = [];
  type = '';
  search = '';
  from = '';
  to = '';
  page = 1;
  meta = { last_page: 1, total: 0 };
  bonusTotal = 0;
  bonusCount = 0;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Transaction[]; last_page: number; total: number; bonus_total?: number; bonus_count?: number }>('/transactions', {
      type: this.type,
      search: this.search,
      from: this.from,
      to: this.to,
      page: this.page,
      per_page: 20,
    }).subscribe((res) => {
      this.transactions = res.data;
      this.meta.last_page = res.last_page;
      this.meta.total = res.total;
      this.bonusTotal = res.bonus_total ?? 0;
      this.bonusCount = res.bonus_count ?? 0;
    });
  }

  resetFilters(): void {
    this.type = '';
    this.search = '';
    this.from = '';
    this.to = '';
    this.page = 1;
    this.load();
  }

  setDatePreset(days: '7' | '30' | '90'): void {
    const now = new Date();
    const fromDate = new Date(now.getTime() - Number(days) * 24 * 60 * 60 * 1000);

    this.from = fromDate.toISOString().slice(0, 10);
    this.to = now.toISOString().slice(0, 10);
    this.page = 1;
    this.load();
  }

  go(p: number): void {
    this.page = p;
    this.load();
  }

  typeClass(type: string): string {
    switch (type) {
      case 'deposit': return 'success';
      case 'withdrawal': return 'pending';
      case 'profit': return 'info';
      case 'return': return 'success';
      case 'investment': return 'info';
      case 'bonus': return 'success';
      default: return 'muted';
    }
  }
}
