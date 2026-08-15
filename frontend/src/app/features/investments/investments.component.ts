import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Investment, InvestmentPlan } from '../../core/models';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Investment Plans</h1>

    <div *ngIf="!plans" class="loading">Loading plans...</div>

    <div class="grid-3" *ngIf="plans">
      <div class="card plan-card" *ngFor="let plan of plans">
        <div class="plan-head">
          <h3>{{ plan.name }}</h3>
          <span *ngIf="plan.badge" class="badge badge-info">{{ plan.badge }}</span>
        </div>
        <p class="muted small">{{ plan.description }}</p>
        <div class="plan-meta">
          <div><span class="muted small">Min</span><div class="mono">{{ api.money(plan.min_amount) }}</div></div>
          <div><span class="muted small">Max</span><div class="mono">{{ plan.max_amount ? api.money(plan.max_amount) : 'Unlimited' }}</div></div>
          <div><span class="muted small">Rate/day</span><div class="mono percent-up">{{ plan.interest_rate }}%</div></div>
          <div><span class="muted small">Duration</span><div class="mono">{{ plan.duration_days }} days</div></div>
        </div>
        <button class="btn btn-primary btn-block" (click)="select(plan)">Invest now</button>
      </div>
    </div>

    <div class="mt-3">
      <h2 class="page-title mb-2">My Investments</h2>
      <div class="card" *ngIf="investments">
        <table class="table">
          <thead>
            <tr><th>Reference</th><th>Plan</th><th>Amount</th><th>Value</th><th>Profit</th><th>Status</th><th>Ends</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of investments.data">
              <td class="mono small">{{ inv.reference }}</td>
              <td>{{ inv.plan?.name }}</td>
              <td class="mono">{{ api.money(inv.amount) }}</td>
              <td class="mono">{{ api.money(inv.current_value) }}</td>
              <td class="mono percent-up">+{{ api.money(inv.total_profit) }}</td>
              <td><span class="badge" [ngClass]="'badge-' + badgeClass(inv.status)">{{ inv.status }}</span></td>
              <td class="small">{{ inv.ends_at ? (inv.ends_at | date: 'mediumDate') : '-' }}</td>
            </tr>
            <tr *ngIf="investments.data.length === 0"><td colspan="7" class="empty">No investments yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="selected">
      <div class="modal card">
        <h3>Invest in {{ selected.name }}</h3>
        <p class="muted small mb-2">{{ selected.interest_rate }}% daily &middot; {{ selected.duration_days }} days</p>

        <div class="field">
          <label>Amount ({{ selected.min_amount | currency: 'USD' }} minimum)</label>
          <input class="input mono" type="number" [(ngModel)]="amount" name="amount" min="0" />
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" (click)="selected = null">Cancel</button>
          <button class="btn btn-primary" (click)="invest()" [disabled]="!amount || amount <= 0 || saving">
            {{ saving ? 'Investing...' : 'Confirm investment' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .plan-card { display: flex; flex-direction: column; gap: 12px; }
    .plan-head { display: flex; justify-content: space-between; align-items: center; }
    .plan-head h3 { font-size: 16px; }
    .plan-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: var(--bg); border-radius: 10px; padding: 12px; }
    .btn-block { width: 100%; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .modal { width: 100%; max-width: 380px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  `],
})
export class InvestmentsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  plans?: InvestmentPlan[];
  investments?: { data: Investment[] };
  selected?: InvestmentPlan | null;
  amount: number | null = null;
  saving = false;

  ngOnInit(): void {
    this.api.get<{ plans: InvestmentPlan[] }>('/plans').subscribe((res) => (this.plans = res.plans));
    this.api.get<{ data: Investment[] }>('/investments').subscribe((res) => (this.investments = res));
  }

  select(plan: InvestmentPlan): void {
    this.selected = plan;
    this.amount = plan.min_amount;
  }

  invest(): void {
    if (!this.selected || !this.amount) return;
    this.saving = true;

    this.api.post<{ message: string }>('/investments', { plan_id: this.selected.id, amount: this.amount }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.selected = null;
        this.saving = false;
        this.ngOnInit();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Investment failed.');
      },
    });
  }

  badgeClass(status: string): string {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      default: return 'danger';
    }
  }
}
