import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-btn" (click)="toggle()" [attr.title]="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <svg *ngIf="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg *ngIf="!isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }

    .theme-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--bg-soft);
      color: var(--text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    }

    .theme-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      transform: scale(1.08);
    }

    .theme-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  isDark = true;

  private readonly darkVars: Record<string, string> = {
    '--bg': '#0f172a',
    '--bg-soft': '#1e293b',
    '--card': '#1e293b',
    '--card-border': '#334155',
    '--text': '#e2e8f0',
    '--text-muted': '#94a3b8',
  };

  private readonly lightVars: Record<string, string> = {
    '--bg': '#f8fafc',
    '--bg-soft': '#f1f5f9',
    '--card': '#ffffff',
    '--card-border': '#e2e8f0',
    '--text': '#1e293b',
    '--text-muted': '#64748b',
  };

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      this.isDark = false;
      this.applyTheme(this.lightVars);
    } else if (saved === 'dark') {
      this.isDark = true;
      this.applyTheme(this.darkVars);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark = prefersDark;
      this.applyTheme(prefersDark ? this.darkVars : this.lightVars);
    }
  }

  toggle(): void {
    this.isDark = !this.isDark;
    const vars = this.isDark ? this.darkVars : this.lightVars;
    this.applyTheme(vars);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  private applyTheme(vars: Record<string, string>): void {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }
}
