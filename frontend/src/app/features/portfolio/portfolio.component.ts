import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Investment } from '../../core/models';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title mb-2">Portfolio</h1>

    <div *ngIf="!investments" class="loading">Loading portfolio...</div>

    <ng-container *ngIf="investments">
      <div class="grid-4">
        <div class="card stat">
          <div class="stat-label muted">Total Invested</div>
          <div class="stat-value mono">{{ api.money(totalInvested) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Current Value</div>
          <div class="stat-value mono">{{ api.money(totalValue) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Total Profit</div>
          <div class="stat-value mono percent-up">+{{ api.money(totalProfit) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Return %</div>
          <div class="stat-value mono percent-up">{{ totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : '0.00' }}%</div>
        </div>
      </div>

      <div class="mt-2 grid-2">
        <div class="card">
          <h3 class="section-title mb-1">Allocation by Plan</h3>
          <div *ngFor="let alloc of allocations" class="alloc-row">
            <span>{{ alloc.name }}</span>
            <div class="alloc-bar"><div class="alloc-fill" [style.width.%]="alloc.percent"></div></div>
            <span class="mono small">{{ alloc.percent.toFixed(1) }}%</span>
          </div>
          <div *ngIf="allocations.length === 0" class="empty">No investments yet.</div>
        </div>

        <div class="card">
          <h3 class="section-title mb-1">Investments</h3>
          <div *ngFor="let inv of investments.data" class="inv-row">
            <div>
              <div class="inv-name">{{ inv.plan?.name }}</div>
              <div class="muted small">{{ inv.reference }}</div>
            </div>
            <div class="inv-right">
              <div class="mono">{{ api.money(inv.current_value) }}</div>
              <div class="percent-up small">+{{ api.money(inv.total_profit) }}</div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .stat-label { font-size: 12px; }
    .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .section-title { font-size: 15px; font-weight: 700; }
    .alloc-row { display: grid; grid-template-columns: 90px 1fr 48px; gap: 10px; align-items: center; padding: 8px 0; }
    .alloc-bar { height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; }
    .alloc-fill { height: 100%; background: var(--primary); border-radius: 4px; }
    .inv-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border); }
    .inv-row:last-child { border-bottom: none; }
    .inv-right { text-align: right; }
  `],
})
export class PortfolioComponent {
  api = inject(ApiService);
  investments?: { data: Investment[] };

  ngOnInit(): void {
    this.api.get<{ data: Investment[] }>('/investments?per_page=100').subscribe((res) => (this.investments = res));
  }

  get totalInvested(): number {
    return this.investments?.data.reduce((s, i) => s + i.amount, 0) ?? 0;
  }

  get totalValue(): number {
    return this.investments?.data.reduce((s, i) => s + i.current_value, 0) ?? 0;
  }

  get totalProfit(): number {
    return this.investments?.data.reduce((s, i) => s + i.total_profit, 0) ?? 0;
  }

  get allocations(): { name: string; percent: number }[] {
    const byPlan = new Map<string, number>();
    for (const inv of this.investments?.data ?? []) {
      const name = inv.plan?.name ?? 'Unknown';
      byPlan.set(name, (byPlan.get(name) ?? 0) + inv.amount);
    }
    const total = this.totalInvested || 1;
    return [...byPlan.entries()].map(([name, amount]) => ({ name, percent: (amount / total) * 100 }));
  }
}
