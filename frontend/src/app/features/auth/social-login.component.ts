import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="social-login-container">
      <button class="social-btn google-btn" (click)="loginWithGoogle()">
        <span class="social-icon google-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </span>
        <span class="social-text">Continue with Google</span>
      </button>

      <button class="social-btn github-btn" (click)="loginWithGitHub()">
        <span class="social-icon github-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </span>
        <span class="social-text">Continue with GitHub</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .social-login-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      font-family: inherit;
    }

    .social-btn:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .social-btn:active {
      transform: translateY(1px);
    }

    .google-btn {
      background-color: #ffffff;
      color: #3c4043;
      border: 1px solid #dadce0;
    }

    .google-btn:hover {
      background-color: #f7f8f8;
      border-color: #c6c6c6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .github-btn {
      background-color: #24292e;
      color: #ffffff;
      border: 1px solid #24292e;
    }

    .github-btn:hover {
      background-color: #2f363d;
      border-color: #2f363d;
    }

    .social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .social-text {
      white-space: nowrap;
    }
  `]
})
export class SocialLoginComponent {
  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8000/api/v1/auth/google/redirect';
  }

  loginWithGitHub(): void {
    window.location.href = 'http://localhost:8000/api/v1/auth/github/redirect';
  }
}
