import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CalculatorComponent } from './calculator.component';
import { AnnouncementBarComponent } from '../../shared/components/announcement-bar.component';
import { AdvertisementComponent } from '../../shared/components/advertisement.component';

interface Plan {
  id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  daily_return: number;
  duration_days: number;
  description?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CalculatorComponent, AnnouncementBarComponent, AdvertisementComponent],
  template: `
    <app-announcement-bar message="Welcome to InvestPro! Start with as little as $100. 🎉" />
    <!-- NAVBAR -->
    <nav class="nav" [class.scrolled]="scrolled">
      <div class="nav-inner">
        <a class="brand" routerLink="/">
          <span class="logo">IP</span>
          <span class="brand-text">InvestPro</span>
        </a>
        <div class="nav-links">
          <a href="#features">Features</a>
          <a href="#plans">Plans</a>
          <a href="#how">How It Works</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div class="nav-actions">
          <a routerLink="/auth/login" class="btn btn-outline btn-sm">Sign In</a>
          <a routerLink="/auth/register" class="btn btn-primary btn-sm">Get Started</a>
        </div>
        <button class="mobile-toggle" (click)="mobileMenuOpen = !mobileMenuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="mobile-menu" *ngIf="mobileMenuOpen">
        <a href="#features" (click)="mobileMenuOpen = false">Features</a>
        <a href="#plans" (click)="mobileMenuOpen = false">Plans</a>
        <a href="#how" (click)="mobileMenuOpen = false">How It Works</a>
        <a href="#testimonials" (click)="mobileMenuOpen = false">Testimonials</a>
        <a routerLink="/auth/login" class="btn btn-primary btn-block mt-2">Sign In</a>
        <a routerLink="/auth/register" class="btn btn-outline btn-block mt-1">Get Started</a>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">Trusted by 10,000+ investors worldwide</div>
        <h1>Grow Your Wealth with<br/><span class="gradient-text">Smart Investments</span></h1>
        <p class="hero-sub">Access professional-grade investment plans with daily returns up to 5%. Start building your portfolio today with as little as $100.</p>
        <div class="hero-actions">
          <a routerLink="/auth/register" class="btn btn-primary btn-lg">Start Investing Now</a>
          <a href="#plans" class="btn btn-outline btn-lg">View Plans</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item">
            <span class="trust-icon">&#10003;</span> No hidden fees
          </div>
          <div class="trust-item">
            <span class="trust-icon">&#10003;</span> Instant deposits
          </div>
          <div class="trust-item">
            <span class="trust-icon">&#10003;</span> 24/7 withdrawals
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="dashboard-preview">
          <div class="preview-header">
            <div class="dots"><span></span><span></span><span></span></div>
            <span class="preview-title">Investment Dashboard</span>
          </div>
          <div class="preview-body">
            <div class="preview-stat-card">
              <span class="stat-label">Total Balance</span>
              <span class="stat-value">$24,580.00</span>
              <span class="stat-change positive">+12.5% this month</span>
            </div>
            <div class="preview-row">
              <div class="preview-mini-card">
                <span class="mini-label">Active Plans</span>
                <span class="mini-value">3</span>
              </div>
              <div class="preview-mini-card">
                <span class="mini-label">Total Earned</span>
                <span class="mini-value positive">$4,250</span>
              </div>
            </div>
            <div class="preview-chart">
              <svg viewBox="0 0 300 80" class="chart-svg">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3"/>
                    <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,8" fill="none" stroke="#6366f1" stroke-width="2.5"/>
                <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,8 L300,80 L0,80 Z" fill="url(#chartGrad)"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <app-calculator />

    <!-- INLINE AD - Between Calculator and Stats -->
    <div class="container" style="margin-top:40px">
      <app-advertisement position="hero" layout="banner" />
    </div>

    <!-- STATS BAR -->
    <section class="stats-bar">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" *ngFor="let s of stats">
            <span class="stat-number">{{ s.value }}</span>
            <span class="stat-desc">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Why InvestPro</span>
          <h2>Everything you need to<br/><span class="gradient-text">invest with confidence</span></h2>
          <p class="section-sub">Our platform combines cutting-edge technology with proven investment strategies to maximize your returns.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let f of features">
            <div class="feature-icon" [style.background]="f.bg">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- INLINE AD - Between Features and Plans -->
    <div class="container" style="padding:0 24px">
      <app-advertisement position="inline" layout="card" />
    </div>

    <!-- PLANS -->
    <section class="section section-alt" id="plans">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Investment Plans</span>
          <h2>Choose your<br/><span class="gradient-text">investment strategy</span></h2>
          <p class="section-sub">Select a plan that matches your goals. All plans include daily returns and flexible withdrawal options.</p>
        </div>
        <div class="plans-grid">
          <div class="plan-card" *ngFor="let p of plans; let i = index" [class.featured]="i === plans.length - 1">
            <div class="plan-badge" *ngIf="i === plans.length - 1">Most Popular</div>
            <h3 class="plan-name">{{ p.name }}</h3>
            <div class="plan-return">
              <span class="return-value">{{ p.daily_return }}%</span>
              <span class="return-label">daily return</span>
            </div>
            <div class="plan-details">
              <div class="plan-detail">
                <span class="detail-label">Min Investment</span>
                <span class="detail-value">\${{ p.min_amount | number:'1.0-0' }}</span>
              </div>
              <div class="plan-detail">
                <span class="detail-label">Max Investment</span>
                <span class="detail-value">\${{ p.max_amount | number:'1.0-0' }}</span>
              </div>
              <div class="plan-detail">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ p.duration_days }} days</span>
              </div>
              <div class="plan-detail">
                <span class="detail-label">Total Return</span>
                <span class="detail-value positive">{{ (p.daily_return * p.duration_days) | number:'1.0-0' }}%</span>
              </div>
            </div>
            <p class="plan-desc" *ngIf="p.description">{{ p.description }}</p>
            <a routerLink="/auth/register" class="btn btn-block" [class.btn-primary]="i === plans.length - 1" [class.btn-outline]="i !== plans.length - 1">Get Started</a>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section" id="how">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">How It Works</span>
          <h2>Start investing in<br/><span class="gradient-text">three simple steps</span></h2>
        </div>
        <div class="steps-grid">
          <div class="step-card" *ngFor="let s of steps; let i = index">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-icon">{{ s.icon }}</div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="section section-alt" id="testimonials">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Testimonials</span>
          <h2>Hear from our<br/><span class="gradient-text">successful investors</span></h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let t of testimonials">
            <div class="testimonial-stars">{{ getStars(t.rating) }}</div>
            <p class="testimonial-text">"{{ t.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar" [style.background]="t.color">{{ t.initials }}</div>
              <div class="author-info">
                <span class="author-name">{{ t.name }}</span>
                <span class="author-role">{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-bg">
            <div class="orb orb-c1"></div>
            <div class="orb orb-c2"></div>
          </div>
          <div class="cta-content">
            <h2>Ready to start growing your wealth?</h2>
            <p>Join thousands of investors who are earning daily returns. Create your free account in under 2 minutes.</p>
            <div class="cta-actions">
              <a routerLink="/auth/register" class="btn btn-primary btn-lg">Create Free Account</a>
              <a routerLink="/auth/login" class="btn btn-ghost btn-lg">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER AD -->
    <div class="container" style="padding:0 24px">
      <app-advertisement position="footer" layout="banner" />
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" routerLink="/">
              <span class="logo">IP</span>
              <span class="brand-text">InvestPro</span>
            </a>
            <p class="footer-desc">Professional investment platform trusted by over 10,000 investors worldwide. Secure, transparent, and designed for growth.</p>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="#plans">Investment Plans</a>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a routerLink="/auth/register">Get Started</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div class="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">FAQ</a>
            <a href="#">support&#64;investpro.com</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2024 InvestPro. All rights reserved.</span>
          <div class="footer-socials">
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* NAVBAR */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 16px 0; transition: all .3s; }
    .nav.scrolled { background: rgba(15,23,42,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--card-border); padding: 12px 0; }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
    .brand-text { font-weight: 800; font-size: 18px; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: var(--text-muted); font-weight: 500; font-size: 14px; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-actions { display: flex; gap: 10px; }
    .mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
    .mobile-toggle span { display: block; width: 22px; height: 2px; background: var(--text); margin: 5px 0; border-radius: 2px; transition: .3s; }
    .mobile-menu { display: none; flex-direction: column; gap: 8px; padding: 16px 24px; background: rgba(15,23,42,.98); border-top: 1px solid var(--card-border); }
    .mobile-menu a { color: var(--text-muted); padding: 8px 0; font-weight: 500; }

    /* HERO */
    .hero { min-height: 100vh; display: flex; align-items: center; padding: 120px 24px 80px; max-width: 1200px; margin: 0 auto; gap: 60px; position: relative; }
    .hero-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .15; }
    .orb-1 { width: 600px; height: 600px; background: var(--primary); top: -200px; left: -100px; animation: float 20s infinite ease-in-out; }
    .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; right: -100px; animation: float 15s infinite ease-in-out reverse; }
    .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 50%; left: 50%; animation: float 18s infinite ease-in-out 2s; }
    @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
    .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.03) 1px, transparent 1px); background-size: 60px 60px; }
    .hero-content { flex: 1; max-width: 580px; }
    .hero-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; background: rgba(99,102,241,.12); color: #a5b4fc; font-size: 13px; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(99,102,241,.2); }
    .hero h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; letter-spacing: -.02em; }
    .gradient-text { background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 17px; color: var(--text-muted); line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
    .hero-actions { display: flex; gap: 14px; margin-bottom: 32px; }
    .hero-trust { display: flex; gap: 24px; flex-wrap: wrap; }
    .trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
    .trust-icon { color: var(--success); font-weight: 700; font-size: 14px; }

    /* Hero visual */
    .hero-visual { flex: 1; max-width: 520px; }
    .dashboard-preview { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.4); }
    .preview-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--card-border); }
    .dots { display: flex; gap: 6px; }
    .dots span { width: 10px; height: 10px; border-radius: 50%; }
    .dots span:nth-child(1) { background: #ef4444; }
    .dots span:nth-child(2) { background: #f59e0b; }
    .dots span:nth-child(3) { background: #22c55e; }
    .preview-title { font-size: 12px; color: var(--text-muted); font-weight: 500; }
    .preview-body { padding: 20px; }
    .preview-stat-card { background: var(--bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-value { display: block; font-size: 24px; font-weight: 800; }
    .stat-change { display: block; font-size: 12px; color: var(--success); font-weight: 600; margin-top: 4px; }
    .preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .preview-mini-card { background: var(--bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; }
    .mini-label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .mini-value { font-size: 18px; font-weight: 700; }
    .mini-value.positive { color: var(--success); }
    .preview-chart { background: var(--bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; }
    .chart-svg { width: 100%; height: auto; }

    /* STATS BAR */
    .stats-bar { background: var(--card); border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border); padding: 40px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
    .stat-number { display: block; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .stat-desc { display: block; font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    /* SECTIONS */
    .section { padding: 100px 24px; }
    .section-alt { background: var(--bg-soft); }
    .container { max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 64px; }
    .section-tag { display: inline-block; padding: 5px 14px; border-radius: 999px; background: rgba(99,102,241,.12); color: #a5b4fc; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 16px; }
    .section-header h2 { font-size: 38px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; letter-spacing: -.02em; }
    .section-sub { font-size: 16px; color: var(--text-muted); max-width: 560px; margin: 0 auto; line-height: 1.7; }

    /* FEATURES */
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 28px; transition: border-color .2s, transform .2s; }
    .feature-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 18px; }
    .feature-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

    /* PLANS */
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
    .plan-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 32px 28px; text-align: center; position: relative; transition: border-color .2s, transform .2s; }
    .plan-card:hover { transform: translateY(-4px); }
    .plan-card.featured { border-color: var(--primary); box-shadow: 0 0 40px rgba(99,102,241,.15); }
    .plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; border-radius: 999px; background: var(--primary); color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    .plan-name { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .plan-return { margin-bottom: 24px; }
    .return-value { display: block; font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .return-label { font-size: 13px; color: var(--text-muted); }
    .plan-details { text-align: left; margin-bottom: 20px; }
    .plan-detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--card-border); }
    .plan-detail:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: var(--text-muted); }
    .detail-value { font-size: 13px; font-weight: 600; }
    .detail-value.positive { color: var(--success); }
    .plan-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }

    /* STEPS */
    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .step-card { text-align: center; padding: 20px; }
    .step-number { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; margin: 0 auto 16px; }
    .step-icon { font-size: 32px; margin-bottom: 12px; }
    .step-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .step-card p { font-size: 14px; color: var(--text-muted); line-height: 1.6; max-width: 300px; margin: 0 auto; }

    /* TESTIMONIALS */
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .testimonial-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 28px; }
    .testimonial-stars { font-size: 16px; margin-bottom: 14px; color: #f59e0b; }
    .testimonial-text { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
    .author-info { display: flex; flex-direction: column; }
    .author-name { font-size: 14px; font-weight: 600; }
    .author-role { font-size: 12px; color: var(--text-muted); }

    /* CTA */
    .cta-section { padding: 100px 24px; }
    .cta-card { position: relative; background: var(--card); border: 1px solid var(--card-border); border-radius: 20px; padding: 80px 40px; text-align: center; overflow: hidden; }
    .cta-bg { position: absolute; inset: 0; overflow: hidden; }
    .orb-c1 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: var(--primary); filter: blur(120px); opacity: .08; top: -100px; right: -100px; }
    .orb-c2 { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: #8b5cf6; filter: blur(100px); opacity: .08; bottom: -100px; left: -80px; }
    .cta-content { position: relative; z-index: 1; }
    .cta-content h2 { font-size: 34px; font-weight: 800; margin-bottom: 16px; }
    .cta-content p { font-size: 16px; color: var(--text-muted); max-width: 480px; margin: 0 auto 32px; line-height: 1.7; }
    .cta-actions { display: flex; gap: 14px; justify-content: center; }
    .btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--card-border); }
    .btn-ghost:hover { border-color: var(--primary); color: var(--primary); }

    /* FOOTER */
    .footer { border-top: 1px solid var(--card-border); padding: 60px 24px 30px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .footer-desc { font-size: 13px; color: var(--text-muted); line-height: 1.7; margin-top: 16px; max-width: 300px; }
    .footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
    .footer-col a { display: block; font-size: 13px; color: var(--text-muted); padding: 4px 0; transition: color .2s; }
    .footer-col a:hover { color: var(--text); }
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--card-border); font-size: 13px; color: var(--text-muted); }
    .footer-socials { display: flex; gap: 20px; }
    .social-link { transition: color .2s; }
    .social-link:hover { color: var(--text); }

    .btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 12px; }
    .btn-block { width: 100%; }
    .positive { color: var(--success); }
    .mt-1 { margin-top: 8px; }
    .mt-2 { margin-top: 16px; }

    @media (max-width: 900px) {
      .hero { flex-direction: column; text-align: center; padding-top: 140px; gap: 40px; }
      .hero-content { max-width: 100%; }
      .hero-sub { margin: 0 auto 32px; }
      .hero-actions { justify-content: center; }
      .hero-trust { justify-content: center; }
      .hero-visual { max-width: 100%; width: 100%; }
      .hero h1 { font-size: 36px; }
      .nav-links, .nav-actions { display: none; }
      .mobile-toggle { display: block; }
      .mobile-menu { display: flex; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .features-grid, .plans-grid, .steps-grid, .testimonials-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .section-header h2 { font-size: 28px; }
      .cta-content h2 { font-size: 26px; }
      .cta-actions { flex-direction: column; align-items: center; }
      .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    }
  `],
})
export class LandingComponent implements OnInit {
  private http = inject(HttpClient);

  scrolled = false;
  mobileMenuOpen = false;
  plans: Plan[] = [];

  stats = [
    { value: '$12.4M+', label: 'Total Invested' },
    { value: '10,247', label: 'Active Investors' },
    { value: '$4.8M+', label: 'Profits Paid' },
    { value: '99.9%', label: 'Uptime' },
  ];

  features = [
    { icon: '⚡', title: 'Instant Processing', desc: 'Deposits are credited instantly. Start investing within minutes of signing up.', bg: 'rgba(99,102,241,.12)' },
    { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your funds and data are protected with 256-bit encryption and 2FA authentication.', bg: 'rgba(34,197,94,.12)' },
    { icon: '📈', title: 'Daily Returns', desc: 'Earn consistent daily returns on your investments. Watch your portfolio grow every day.', bg: 'rgba(139,92,246,.12)' },
    { icon: '💳', title: 'Multiple Payment Methods', desc: 'Deposit and withdraw using credit cards, bank transfers, or cryptocurrency.', bg: 'rgba(6,182,212,.12)' },
    { icon: '👥', title: 'Referral Program', desc: 'Earn bonus commissions by inviting friends and family to join the platform.', bg: 'rgba(245,158,11,.12)' },
    { icon: '🎧', title: '24/7 Support', desc: 'Our dedicated support team is available around the clock to assist you.', bg: 'rgba(239,68,68,.12)' },
  ];

  steps = [
    { icon: '📝', title: 'Create Account', desc: 'Sign up in under 2 minutes. No lengthy paperwork or credit checks required.' },
    { icon: '💰', title: 'Fund Your Wallet', desc: 'Choose from multiple payment methods. Deposits are processed instantly.' },
    { icon: '🚀', title: 'Start Earning', desc: 'Pick an investment plan and watch your returns accumulate daily.' },
  ];

  testimonials = [
    { name: 'James Wilson', initials: 'JW', role: 'Investor since 2023', rating: 5, text: 'InvestPro has completely changed how I grow my wealth. The daily returns are consistent and withdrawals are always processed on time.', color: '#6366f1' },
    { name: 'Sarah Chen', initials: 'SC', role: 'Investor since 2022', rating: 5, text: 'I was skeptical at first, but after 6 months of consistent returns, I can confidently say this is the best platform I\'ve used.', color: '#8b5cf6' },
    { name: 'Michael Brown', initials: 'MB', role: 'Investor since 2023', rating: 5, text: 'The interface is clean, the plans are transparent, and the support team responds within minutes. Highly recommended!', color: '#06b6d4' },
  ];

  ngOnInit(): void {
    window.addEventListener('scroll', () => {
      this.scrolled = window.scrollY > 40;
    });

    this.http.get<{ data: Plan[] }>('/api/v1/plans').subscribe({
      next: (res) => {
        this.plans = (res.data ?? res as any).filter((p: any) => p.is_active !== false).slice(0, 3);
        if (this.plans.length === 0) this.plans = this.fallbackPlans();
      },
      error: () => { this.plans = this.fallbackPlans(); },
    });
  }

  getStars(n: number): string {
    return '\u2605'.repeat(n);
  }

  private fallbackPlans(): Plan[] {
    return [
      { id: 1, name: 'Starter', min_amount: 100, max_amount: 2999, daily_return: 1.5, duration_days: 30, description: 'Perfect for beginners looking to start their investment journey.' },
      { id: 2, name: 'Professional', min_amount: 3000, max_amount: 9999, daily_return: 2.5, duration_days: 45, description: 'Best value for serious investors seeking higher returns.' },
      { id: 3, name: 'Enterprise', min_amount: 10000, max_amount: 50000, daily_return: 5, duration_days: 60, description: 'Maximum returns for our most experienced investors.' },
    ];
  }
}
