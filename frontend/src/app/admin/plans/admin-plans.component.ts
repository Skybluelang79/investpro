import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { InvestmentPlan } from '../../core/models';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Investment Plans</h1>
      <button class="btn btn-primary" (click)="openEdit()">+ New plan</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Range</th><th>Rate/day</th><th>Duration</th><th>Investments</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of plans">
            <td><strong>{{ p.name }}</strong> <span *ngIf="p.badge" class="badge badge-info">{{ p.badge }}</span></td>
            <td class="small">{{ api.money(p.min_amount) }} - {{ p.max_amount ? api.money(p.max_amount) : 'Unlimited' }}</td>
            <td class="mono percent-up">{{ p.interest_rate }}%</td>
            <td class="small">{{ p.duration_days }} days</td>
            <td class="mono">{{ p.investments_count ?? 0 }}</td>
            <td><span class="badge" [ngClass]="p.is_active ? 'badge-success' : 'badge-danger'">{{ p.is_active ? 'active' : 'inactive' }}</span></td>
            <td>
              <div class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="openEdit(p)">Edit</button>
                <button class="btn btn-outline btn-sm" (click)="toggle(p)">{{ p.is_active ? 'Disable' : 'Enable' }}</button>
                <button class="btn btn-danger btn-sm" (click)="remove(p)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="editing">
      <div class="modal card">
        <h3 class="mb-2">{{ form.id ? 'Edit plan' : 'New plan' }}</h3>
        <form (ngSubmit)="save()">
          <div class="field"><label>Name</label><input class="input" [(ngModel)]="form.name" name="name" required /></div>
          <div class="field"><label>Description</label><textarea class="input" rows="2" [(ngModel)]="form.description" name="description"></textarea></div>
          <div class="grid-2">
            <div class="field"><label>Min amount</label><input class="input" type="number" [(ngModel)]="form.min_amount" name="min_amount" required /></div>
            <div class="field"><label>Max amount (blank = unlimited)</label><input class="input" type="number" [(ngModel)]="form.max_amount" name="max_amount" /></div>
          </div>
          <div class="grid-2">
            <div class="field"><label>Daily interest %</label><input class="input" type="number" step="0.01" [(ngModel)]="form.interest_rate" name="interest_rate" required /></div>
            <div class="field"><label>Duration (days)</label><input class="input" type="number" [(ngModel)]="form.duration_days" name="duration_days" required /></div>
          </div>
          <div class="field"><label>Badge</label><input class="input" [(ngModel)]="form.badge" name="badge" /></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="editing = false">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .row-actions { display: flex; gap: 6px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .modal { width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  `],
})
export class AdminPlansComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  plans: InvestmentPlan[] = [];
  editing = false;
  saving = false;
  form: Partial<InvestmentPlan> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ plans: InvestmentPlan[] }>('/admin/plans').subscribe((res) => (this.plans = res.plans));
  }

  openEdit(plan?: InvestmentPlan): void {
    this.form = plan ? { ...plan } : { name: '', min_amount: 100, max_amount: null, interest_rate: 1, duration_days: 30 };
    this.editing = true;
  }

  save(): void {
    this.saving = true;
    const obs = this.form.id
      ? this.api.put(`/admin/plans/${this.form.id}`, this.form)
      : this.api.post('/admin/plans', this.form);

    obs.subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.saving = false;
        this.editing = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Save failed.');
      },
    });
  }

  toggle(p: InvestmentPlan): void {
    this.api.post(`/admin/plans/${p.id}/toggle-active`).subscribe({
      next: () => {
        this.toast.success('Plan status updated.');
        this.load();
      },
    });
  }

  remove(p: InvestmentPlan): void {
    if (!confirm(`Delete plan "${p.name}"?`)) return;
    this.api.delete(`/admin/plans/${p.id}`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Delete failed.'),
    });
  }
}
