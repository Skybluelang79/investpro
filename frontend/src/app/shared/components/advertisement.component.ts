import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string;
  position: string;
  ad_type: 'banner' | 'card' | 'text';
  width: number | null;
  height: number | null;
  is_active: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
}

@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="ad">
      <!-- Banner -->
      <div
        *ngIf="ad.ad_type === 'banner'"
        class="ad-banner"
        [class.ad-horizontal]="layout === 'horizontal'"
        (click)="handleClick()"
      >
        <div class="ad-banner-body">
          <div class="ad-banner-text">
            <h3 class="ad-title">{{ ad.title }}</h3>
            <p class="ad-desc" *ngIf="ad.description">{{ ad.description }}</p>
            <span class="ad-cta">Learn More &rarr;</span>
          </div>
          <div class="ad-banner-image" *ngIf="ad.image_url">
            <img [src]="ad.image_url" [alt]="ad.title" />
          </div>
        </div>
        <span class="ad-label">Ad</span>
      </div>

      <!-- Card -->
      <div
        *ngIf="ad.ad_type === 'card'"
        class="ad-card"
        [class.ad-vertical]="layout === 'vertical'"
        (click)="handleClick()"
      >
        <div class="ad-card-image" *ngIf="ad.image_url">
          <img [src]="ad.image_url" [alt]="ad.title" />
        </div>
        <div class="ad-card-body">
          <h4 class="ad-title">{{ ad.title }}</h4>
          <p class="ad-desc" *ngIf="ad.description">{{ ad.description }}</p>
          <span class="ad-cta">View &rarr;</span>
        </div>
        <span class="ad-label">Ad</span>
      </div>

      <!-- Text -->
      <div
        *ngIf="ad.ad_type === 'text'"
        class="ad-text"
        (click)="handleClick()"
      >
        <span class="ad-text-content">
          <strong>{{ ad.title }}</strong>
          <span *ngIf="ad.description" class="ad-text-desc"> &mdash; {{ ad.description }}</span>
        </span>
        <span class="ad-label">Sponsored</span>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }

    .ad-banner {
      position: relative;
      background: linear-gradient(135deg, var(--color-primary, #2563eb), var(--color-secondary, #7c3aed));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 28px 32px;
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ad-banner:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
    }
    .ad-horizontal .ad-banner-body { flex-direction: row; align-items: center; }
    .ad-banner-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }
    .ad-banner-text { flex: 1; color: #fff; }
    .ad-banner-image {
      flex-shrink: 0;
      width: 160px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
    }
    .ad-banner-image img { width: 100%; height: 100%; object-fit: cover; }

    .ad-card {
      position: relative;
      display: flex;
      align-items: stretch;
      background: var(--bg-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ad-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    .ad-vertical {
      flex-direction: column;
    }
    .ad-card-image {
      width: 180px;
      min-height: 120px;
      flex-shrink: 0;
      overflow: hidden;
    }
    .ad-vertical .ad-card-image {
      width: 100%;
      height: 160px;
    }
    .ad-card-image img { width: 100%; height: 100%; object-fit: cover; }
    .ad-card-body {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
      flex: 1;
    }

    .ad-text {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-card, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .ad-text:hover { background: var(--bg-card-hover, rgba(255, 255, 255, 0.06)); }
    .ad-text-content {
      font-size: 14px;
      color: var(--text-primary, #e2e8f0);
    }
    .ad-text-desc {
      color: var(--text-secondary, #94a3b8);
      font-weight: 400;
    }

    .ad-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .ad-card .ad-title {
      color: var(--text-primary, #e2e8f0);
    }
    .ad-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin: 4px 0 0;
      line-height: 1.5;
    }
    .ad-card .ad-desc {
      color: var(--text-secondary, #94a3b8);
    }
    .ad-cta {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
      opacity: 0.9;
    }
    .ad-card .ad-cta {
      color: var(--color-primary, #2563eb);
    }
    .ad-label {
      position: absolute;
      top: 8px;
      right: 10px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .ad-card .ad-label {
      color: var(--text-secondary, #94a3b8);
      background: var(--bg-card, rgba(255, 255, 255, 0.04));
    }
  `],
})
export class AdvertisementComponent implements OnInit {
  @Input() position: string = 'inline';
  @Input() layout: string = 'banner';

  private api = inject(ApiService);

  ad: Advertisement | null = null;

  ngOnInit(): void {
    this.api.get<{ advertisements: Advertisement[] }>('/v1/advertisements', { position: this.position }).subscribe({
      next: (res) => {
        const active = (res.advertisements ?? []).filter((a) => a.is_active);
        if (active.length > 0) {
          this.ad = active[0];
          this.trackImpression();
        }
      },
      error: () => {},
    });
  }

  handleClick(): void {
    if (!this.ad) return;
    this.api.post(`/v1/advertisements/${this.ad.id}/click`).subscribe();
    if (this.ad.link_url) {
      window.open(this.ad.link_url, '_blank', 'noopener');
    }
  }

  private trackImpression(): void {
    if (!this.ad) return;
    this.api.post(`/v1/advertisements/${this.ad.id}/impression`).subscribe();
  }
}
