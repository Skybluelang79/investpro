import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardData } from '../../core/models';
import { InvestmentStatusBadgePipe } from '../../shared/pipes/status.pipe';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentStatusBadgePipe],
  template: `
    <div *ngIf="!data" class="loading">Loading dashboard...</div>

    <ng-container *ngIf="data">
      <div class="grid-2">
        <div class="card balance-card">
          <div class="muted small">Total Balance</div>
          <div class="balance mono">{{ api.money(data.total_balance) }}</div>
          <div [class]="data.monthly_growth >= 0 ? 'percent-up' : 'percent-down'">
            {{ data.monthly_growth >= 0 ? '+' : '' }}{{ data.monthly_growth.toFixed(2) }}% this month
          </div>
        </div>
        <div class="card">
          <div class="muted small mb-1">Portfolio Performance</div>
          <svg viewBox="0 0 300 120" class="sparkline" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path [attr.d]="areaPath" fill="url(#area)"/>
            <path [attr.d]="linePath" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div class="chart-labels">
            <span *ngFor="let point of data.chart" class="muted small">{{ point.month }}</span>
          </div>
        </div>
      </div>

      <div class="grid-4 mt-2">
        <div class="card stat">
          <div class="stat-label muted">Invested</div>
          <div class="stat-value mono">{{ api.money(data.active_invested) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Profit</div>
          <div class="stat-value mono">{{ api.money(data.total_profit) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Bonus Balance</div>
          <div class="stat-value mono">{{ api.money(data.bonus_balance) }}</div>
        </div>
        <div class="card stat">
          <div class="stat-label muted">Referral Bonus Earned</div>
          <div class="stat-value mono">{{ api.money(data.referral_bonus_earned) }}</div>
        </div>
      </div>

      <div class="grid-2 mt-2">
        <div class="card stat">
          <div class="stat-label muted">Total Referrals</div>
          <div class="stat-value">{{ data.referrals_count }}</div>
          <div class="muted small mt-1">Invite friends and earn more.</div>
        </div>
        <div class="card promo">
          <div class="stat-label muted">Referral code</div>
          <div class="stat-value mono">{{ data.referral_code ?? 'Not available' }}</div>
          <div class="muted small mt-1">Share this code with new users.</div>
          <button class="btn btn-outline btn-sm mt-2" type="button" (click)="copyReferralCode()" [disabled]="!data?.referral_code">
            Copy referral link
          </button>
          <button class="btn btn-primary btn-sm mt-2" type="button" (click)="openShareModal()" [disabled]="!data?.referral_code">
            Share referral link
          </button>
        </div>
      </div>

      <div class="card mt-2">
        <div class="flex-between mb-2">
          <div>
            <div class="stat-label muted">Referral analytics</div>
            <div class="muted small">Last 6 months of referral activity and earned bonus</div>
          </div>
        </div>
        <svg viewBox="0 0 600 180" class="chart" preserveAspectRatio="none">
          <path [attr.d]="referralReferralsPath" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <path [attr.d]="referralBonusPath" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"/>
        </svg>
        <canvas #refChart class="chart-canvas" style="width:100%;height:200px;display:block;margin-top:10px;"></canvas>
        <div class="chart-labels">
          <span *ngFor="let point of data.referral_chart" class="muted small">{{ point.month }}</span>
        </div>
        <div class="legend small">
          <span><i class="dot green"></i> Referrals</span>
          <span><i class="dot blue"></i> Bonus earned</span>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="shareModalOpen">
        <div class="modal card share-modal">
          <h3 class="mb-2">Share referral link</h3>
          <p class="muted small">Send your invite link to friends and earn referral rewards.</p>
          <div class="link-box"><a [href]="referralLink" target="_blank" rel="noopener noreferrer">{{ referralLink }}</a></div>
          <div class="modal-actions">
            <button class="btn btn-outline" type="button" (click)="closeShareModal()">Cancel</button>
            <button class="btn btn-outline" type="button" (click)="openReferral()">Open</button>
            <button class="btn btn-primary" type="button" (click)="shareReferral()">Copy / Share</button>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <h2 class="section-title">Active Investments</h2>
        <div class="card mt-1">
          <div *ngFor="let inv of data.active_investments" class="inv-row">
            <div>
              <div class="inv-name">{{ inv.plan?.name }}</div>
              <div class="muted small">{{ inv.reference }} &middot; {{ inv.status | investmentStatusBadge }}</div>
            </div>
            <div class="inv-right">
              <div class="mono">{{ api.money(inv.amount) }}</div>
              <div class="percent-up small">+{{ api.money(inv.total_profit) }} profit &middot; {{ inv.plan?.interest_rate }}%/day</div>
            </div>
          </div>
          <div *ngIf="data.active_investments.length === 0" class="empty">
            No active investments. <a routerLink="/investments" class="link">Start investing</a>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .balance-card { display: flex; flex-direction: column; justify-content: center; }
    .balance { font-size: 34px; font-weight: 800; margin: 6px 0; }
    .sparkline { width: 100%; height: 110px; display: block; }
    .chart-labels { display: flex; justify-content: space-between; margin-top: 4px; }
    .stat-label { font-size: 12px; }
    .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .section-title { font-size: 16px; font-weight: 700; }
    .inv-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0; border-bottom: 1px solid var(--card-border);
    }
    .inv-row:last-child { border-bottom: none; }
    .inv-name { font-weight: 600; }
    .inv-right { text-align: right; }
    .link { color: var(--primary); font-weight: 600; cursor: pointer; }
    .card.promo { padding: 20px; }
    .card.promo .btn { width: 100%; }
    .chart { width: 100%; height: 180px; display: block; margin-top: 10px; }
    .legend { display: flex; gap: 16px; margin-top: 12px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
    .dot.green { background: #22c55e; }
    .dot.blue { background: #38bdf8; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .share-modal { width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; gap: 16px; padding: 24px; }
    .link-box { background: rgba(100, 116, 139, 0.08); border: 1px solid rgba(148, 163, 184, 0.3); padding: 12px 14px; border-radius: 12px; word-break: break-all; margin: 14px 0; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `],
})
export class DashboardComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);
  data?: DashboardData;

  ngOnInit(): void {
    this.api.get<DashboardData>('/dashboard').subscribe({
      next: (res) => (this.data = res),
      error: () => undefined,
    });
  }

  shareModalOpen = false;
  referralLink = '';

  async copyReferralCode(): Promise<void> {
    const link = this.data?.referral_code ? `${window.location.origin}/auth/register?referral=${this.data.referral_code}` : '';

    if (!link) {
      this.toast.error('Referral code is not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      this.toast.success('Referral link copied to clipboard.');
    } catch {
      this.toast.error('Unable to copy referral link.');
    }
  }

  openShareModal(): void {
    this.referralLink = this.data?.referral_code ? `${window.location.origin}/auth/register?referral=${this.data.referral_code}` : '';
    this.shareModalOpen = true;
  }

  closeShareModal(): void {
    this.shareModalOpen = false;
  }

  async shareReferral(): Promise<void> {
    if (!this.referralLink) {
      this.toast.error('Referral link is not available.');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on InvestPro',
          text: 'Use my referral link to join and earn bonus rewards.',
          url: this.referralLink,
        });
        this.toast.success('Referral link shared successfully.');
        this.shareModalOpen = false;
        return;
      } catch {
        // fall back to copy if native share is not completed
      }
    }

    try {
      await navigator.clipboard.writeText(this.referralLink);
      this.toast.success('Referral link copied to clipboard.');
      this.shareModalOpen = false;
    } catch {
      this.toast.error('Unable to copy referral link.');
    }
  }

  openReferral(): void {
    if (!this.referralLink) {
      this.toast.error('Referral link is not available.');
      return;
    }
    try {
      window.open(this.referralLink, '_blank', 'noopener');
    } catch {
      // if popup blocked, fallback to copying
      navigator.clipboard.writeText(this.referralLink).then(() => this.toast.success('Referral link copied to clipboard.'), () => this.toast.error('Unable to open referral link.'));
    }
  }

  get linePath(): string {
    const pts = this.points();
    if (pts.length < 2) return '';
    return 'M' + pts.map((p) => `${p.x},${p.y}`).join(' L');
  }

  get areaPath(): string {
    const pts = this.points();
    if (pts.length < 2) return '';
    const line = 'M' + pts.map((p) => `${p.x},${p.y}`).join(' L');
    return `${line} L ${pts[pts.length - 1].x},120 L ${pts[0].x},120 Z`;
  }

  get referralReferralsPath(): string {
    return this.chartPath(this.data?.referral_chart?.map((c) => c.referrals) ?? []);
  }

  get referralBonusPath(): string {
    return this.chartPath(this.data?.referral_chart?.map((c) => c.bonus) ?? []);
  }

  private chartPath(values: number[]): string {
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const points = values.map((v, i) => ({
      x: (i / (values.length - 1)) * 600,
      y: 158 - ((v - min) / range) * 140,
    }));
    return 'M' + points.map((p) => `${p.x},${p.y}`).join(' L');
  }

  private points(): { x: number; y: number }[] {
    const values = this.data?.chart?.map((c) => c.value) ?? [];
    if (values.length === 0) return [];
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return values.map((v, i) => ({
      x: (i / (values.length - 1)) * 300,
      y: 118 - ((v - min) / range) * 100,
    }));
  }
}
