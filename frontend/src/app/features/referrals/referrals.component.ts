import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <div>
        <h1 class="page-title">Referral Dashboard</h1>
        <div class="muted small">Invite friends and earn bonus rewards</div>
      </div>
    </div>

    <div class="grid-2 mb-2">
      <div class="card stat">
        <div class="stat-label muted">Total Referrals</div>
        <div class="stat-value">{{ referralsCount }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label muted">Total Bonus Earned</div>
        <div class="stat-value mono">{{ api.money(bonusEarned) }}</div>
      </div>
    </div>

    <div class="grid-2 mb-2">
      <div class="card promo">
        <div class="stat-label muted mb-1">Your Referral Code</div>
        <div class="code-display mono">{{ referralCode ?? 'Not available' }}</div>
        <button class="btn btn-primary btn-sm mt-2 full-width" type="button" (click)="copyCode()" [disabled]="!referralCode">
          Copy Code
        </button>
      </div>
      <div class="card promo">
        <div class="stat-label muted mb-1">Share Link</div>
        <div class="link-box">{{ shareLink }}</div>
        <button class="btn btn-primary btn-sm mt-2 full-width" type="button" (click)="copyLink()" [disabled]="!referralCode">
          Copy Link
        </button>
      </div>
    </div>

    <div class="card mb-2" *ngIf="chartData.length > 0">
      <div class="stat-label muted mb-2">Referral Activity (Last 6 Months)</div>
      <div class="bar-chart">
        <div class="bar-group" *ngFor="let point of chartData">
          <div class="bars">
            <div class="bar bar-referrals" [style.height.%]="barHeight(point.referrals)" [title]="point.referrals + ' referrals'"></div>
            <div class="bar bar-bonus" [style.height.%]="barHeight(point.bonus)" [title]="api.money(point.bonus) + ' bonus'"></div>
          </div>
          <div class="bar-label muted small">{{ point.month }}</div>
        </div>
      </div>
      <div class="legend small mt-2">
        <span><i class="dot green"></i> Referrals</span>
        <span><i class="dot blue"></i> Bonus earned</span>
      </div>
    </div>

    <div class="card" *ngIf="recentReferrals.length > 0">
      <div class="stat-label muted mb-2">Recent Referrals</div>
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Joined</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let ref of recentReferrals">
            <td class="small">{{ ref.name }}</td>
            <td class="small">{{ ref.email }}</td>
            <td class="small">{{ ref.created_at | date: 'medium' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .page-title { font-size: 20px; font-weight: 800; }
    .promo { padding: 20px; }
    .code-display { font-size: 22px; font-weight: 700; padding: 12px 0; }
    .link-box {
      background: rgba(100, 116, 139, 0.08); border: 1px solid rgba(148, 163, 184, 0.3);
      padding: 10px 12px; border-radius: 10px; word-break: break-all; font-size: 13px;
      max-height: 60px; overflow-y: auto;
    }
    .full-width { width: 100%; }
    .bar-chart {
      display: flex; gap: 12px; align-items: flex-end; height: 160px; padding-top: 10px;
    }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .bars { display: flex; gap: 4px; align-items: flex-end; height: 130px; }
    .bar {
      width: 20px; min-height: 4px; border-radius: 4px 4px 0 0; transition: height 0.3s ease;
    }
    .bar-referrals { background: #22c55e; }
    .bar-bonus { background: #38bdf8; }
    .bar-label { margin-top: 6px; text-align: center; }
    .legend { display: flex; gap: 16px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
    .dot.green { background: #22c55e; }
    .dot.blue { background: #38bdf8; }
  `],
})
export class ReferralsComponent implements OnInit {
  api = inject(ApiService);
  private toast = inject(ToastService);

  referralCode: string | null = null;
  shareLink = '';
  referralsCount = 0;
  bonusEarned = 0;
  chartData: { month: string; referrals: number; bonus: number }[] = [];
  recentReferrals: { name: string; email: string; created_at?: string }[] = [];
  private maxChartValue = 1;

  ngOnInit(): void {
    this.api.get<DashboardData>('/dashboard').subscribe({
      next: (res) => {
        this.referralCode = res.referral_code ?? null;
        this.referralsCount = res.referrals_count;
        this.bonusEarned = res.referral_bonus_earned;
        this.chartData = res.referral_chart ?? [];
        if (this.chartData.length > 0) {
          this.maxChartValue = Math.max(
            ...this.chartData.map((c) => Math.max(c.referrals, c.bonus)),
            1,
          );
        }
        this.shareLink = this.referralCode
          ? `${window.location.origin}/auth/register?referral=${this.referralCode}`
          : '';
        this.recentReferrals = (res as any).recent_referrals ?? [];
      },
      error: () => this.toast.error('Failed to load referral data.'),
    });
  }

  barHeight(value: number): number {
    return Math.max((value / this.maxChartValue) * 100, 3);
  }

  async copyCode(): Promise<void> {
    if (!this.referralCode) {
      this.toast.error('Referral code is not available.');
      return;
    }
    try {
      await navigator.clipboard.writeText(this.referralCode);
      this.toast.success('Referral code copied to clipboard.');
    } catch {
      this.toast.error('Unable to copy referral code.');
    }
  }

  async copyLink(): Promise<void> {
    if (!this.shareLink) {
      this.toast.error('Referral link is not available.');
      return;
    }
    try {
      await navigator.clipboard.writeText(this.shareLink);
      this.toast.success('Referral link copied to clipboard.');
    } catch {
      this.toast.error('Unable to copy referral link.');
    }
  }
}
