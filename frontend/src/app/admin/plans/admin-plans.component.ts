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
    <h1 class="page-title mb-2">Investment Plans</h1>

    <div class="card mb-2">
      <button class="btn btn-primary" (click)="showCreateForm = true">+ Create New Plan</button>
    </div>

    <!-- Create/Edit Inline Form -->
    <div class="card mb-2" *ngIf="showCreateForm">
      <h3 class="section-title mb-2">{{ editingPlan ? 'Edit Plan' : 'Create New Plan' }}</h3>
      <form (ngSubmit)="savePlan()">
        <div class="grid-2">
          <div class="field">
            <label>Plan Name</label>
            <input class="input" type="text" [(ngModel)]="planForm.name" name="name" required />
          </div>
          <div class="field">
            <label>Duration (days)</label>
            <input class="input" type="number" [(ngModel)]="planForm.duration_days" name="duration" required />
          </div>
          <div class="field">
            <label>Interest Rate (% per day)</label>
            <input class="input" type="number" step="0.01" [(ngModel)]="planForm.interest_rate" name="rate" required />
          </div>
          <div class="field">
            <label>Min Amount</label>
            <input class="input" type="number" [(ngModel)]="planForm.min_amount" name="min" required />
          </div>
          <div class="field">
            <label>Max Amount (blank = unlimited)</label>
            <input class="input" type="number" [(ngModel)]="planForm.max_amount" name="max" />
          </div>
          <div class="field">
            <label>Badge</label>
            <input class="input" type="text" [(ngModel)]="planForm.badge" name="badge" />
          </div>
        </div>
        <div class="field">
          <label>Description</label>
          <textarea class="input" rows="2" [(ngModel)]="planForm.description" name="description"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" (click)="cancelForm()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save Plan' }}</button>
        </div>
      </form>
    </div>

    <!-- Plans List -->
    <div class="card">
      <div *ngIf="plans.length === 0" class="loading">Loading plans...</div>
      <table class="table" *ngIf="plans.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Range</th>
            <th>Rate/day</th>
            <th>Duration</th>
            <th>Investments</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of plans">
            <td><strong>{{ p.name }}</strong> <span *ngIf="p.badge" class="badge badge-info">{{ p.badge }}</span></td>
            <td class="small">{{ api.money(p.min_amount) }} - {{ p.max_amount ? api.money(p.max_amount) : 'Unlimited' }}</td>
            <td class="mono percent-up">{{ p.interest_rate }}%</td>
            <td class="small">{{ p.duration_days }} days</td>
            <td class="mono">{{ p.investments_count ?? 0 }}</td>
            <td>
              <span class="badge" [ngClass]="p.is_active ? 'badge-success' : 'badge-danger'">
                {{ p.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs btn-outline" (click)="editPlan(p)">Edit</button>
                <button class="btn btn-xs btn-outline" (click)="togglePlanStatus(p)">{{ p.is_active ? 'Deactivate' : 'Activate' }}</button>
                <button class="btn btn-xs btn-danger" (click)="deletePlan(p.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
    .row-actions { display: flex; gap: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `],
})
export class AdminPlansComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  plans: InvestmentPlan[] = [];
  showCreateForm = false;
  saving = false;
  planForm: Partial<InvestmentPlan> = {};
  editingPlan: InvestmentPlan | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ plans: InvestmentPlan[] }>('/admin/plans').subscribe((res) => (this.plans = res.plans));
  }

  savePlan(): void {
    this.saving = true;
    const obs = this.planForm.id
      ? this.api.put<{ message: string }>(`/admin/plans/${this.planForm.id}`, this.planForm)
      : this.api.post<{ message: string }>('/admin/plans', this.planForm);

    obs.subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.saving = false;
        this.showCreateForm = false;
        this.editingPlan = null;
        this.planForm = {};
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Save failed.');
      },
    });
  }

  editPlan(plan: InvestmentPlan): void {
    this.editingPlan = plan;
    this.planForm = { ...plan };
    this.showCreateForm = true;
  }

  togglePlanStatus(p: InvestmentPlan): void {
    this.api.post(`/admin/plans/${p.id}/toggle-active`).subscribe({
      next: () => {
        this.toast.success('Plan status updated.');
        this.load();
      },
    });
  }

  deletePlan(id: number): void {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan || !confirm(`Delete plan "${plan.name}"?`)) return;
    this.api.delete<{ message: string }>(`/admin/plans/${id}`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Delete failed.'),
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingPlan = null;
    this.planForm = {};
  }
}
