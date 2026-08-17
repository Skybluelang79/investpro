import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { InvestmentPlan } from '../../core/models';

@Component({
  selector: 'app-plans',
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
          <div><span class="muted small">Daily Return</span><div class="mono percent-up">{{ plan.interest_rate }}%</div></div>
          <div><span class="muted small">Duration</span><div class="mono">{{ plan.duration_days }} days</div></div>
          <div><span class="muted small">Min Amount</span><div class="mono">{{ api.money(plan.min_amount) }}</div></div>
          <div><span class="muted small">Max Amount</span><div class="mono">{{ plan.max_amount ? api.money(plan.max_amount) : 'Unlimited' }}</div></div>
          <div class="plan-full-width"><span class="muted small">Total Return</span><div class="mono percent-up">{{ plan.interest_rate * plan.duration_days | number:'1.0-1' }}%</div></div>
        </div>
        <button class="btn btn-primary btn-block" (click)="select(plan)">Invest Now</button>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="selected" (click)="selected = null">
      <div class="modal card" (click)="$event.stopPropagation()">
        <h3>Invest in {{ selected.name }}</h3>
        <p class="muted small mb-2">{{ selected.interest_rate }}% daily &middot; {{ selected.duration_days }} days &middot; {{ selected.interest_rate * selected.duration_days | number:'1.0-1' }}% total</p>

        <div class="field">
          <label>Amount (min {{ api.money(selected.min_amount) }})</label>
          <input class="input mono" type="number" [(ngModel)]="amount" name="amount" [min]="selected.min_amount" [max]="selected.max_amount ?? undefined" />
        </div>

        <div class="return-preview" *ngIf="amount && amount >= selected.min_amount">
          <div class="return-row"><span class="muted small">Daily profit</span><span class="mono percent-up">+{{ api.money(amount * selected.interest_rate / 100) }}</span></div>
          <div class="return-row"><span class="muted small">Total profit</span><span class="mono percent-up">+{{ api.money(amount * selected.interest_rate * selected.duration_days / 100) }}</span></div>
          <div class="return-row"><span class="muted small">Total value</span><span class="mono bold">{{ api.money(amount + amount * selected.interest_rate * selected.duration_days / 100) }}</span></div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" type="button" (click)="selected = null">Cancel</button>
          <button class="btn btn-primary" type="button" (click)="invest()" [disabled]="!amount || amount < selected.min_amount || saving">
            {{ saving ? 'Investing...' : 'Confirm Investment' }}
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
    .plan-full-width { grid-column: 1 / -1; }
    .btn-block { width: 100%; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .modal { width: 100%; max-width: 420px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .return-preview { background: var(--bg); border-radius: 10px; padding: 12px; margin-top: 8px; }
    .return-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .bold { font-weight: 700; }
  `],
})
export class PlansComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  plans?: InvestmentPlan[];
  selected?: InvestmentPlan | null;
  amount: number | null = null;
  saving = false;

  ngOnInit(): void {
    this.api.get<{ plans: InvestmentPlan[] }>('/plans').subscribe((res) => (this.plans = res.plans));
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
        this.router.navigate(['/investments']);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Investment failed.');
      },
    });
  }
}
