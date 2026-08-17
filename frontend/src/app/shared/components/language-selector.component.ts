import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, SupportedLanguage } from '../../core/services/i18n.service';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="language-selector">
      <span class="current-flag">{{ currentFlag }}</span>
      <select
        [ngModel]="currentLang"
        (ngModelChange)="onLanguageChange($event)"
        class="lang-select"
      >
        <option *ngFor="let lang of languages" [value]="lang.code">
          {{ lang.flag }} {{ lang.label }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .language-selector {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--color-bg-secondary, #1e293b);
      border: 1px solid var(--color-border, #334155);
      border-radius: 6px;
      padding: 6px 12px;
      transition: border-color 0.2s ease;
    }

    .language-selector:hover {
      border-color: var(--color-primary, #2563eb);
    }

    .current-flag {
      font-size: 18px;
      line-height: 1;
    }

    .lang-select {
      background: transparent;
      color: var(--color-text, #e2e8f0);
      border: none;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      padding-right: 4px;
      -webkit-appearance: none;
      appearance: none;
    }

    .lang-select option {
      background: var(--color-bg-primary, #0f172a);
      color: var(--color-text, #e2e8f0);
    }
  `]
})
export class LanguageSelectorComponent {
  languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  currentLang: SupportedLanguage;

  constructor(private i18n: I18nService) {
    this.currentLang = this.i18n.getLanguage();
  }

  get currentFlag(): string {
    return this.languages.find(l => l.code === this.currentLang)?.flag ?? '🇺🇸';
  }

  onLanguageChange(lang: SupportedLanguage): void {
    this.currentLang = lang;
    this.i18n.setLanguage(lang);
  }
}
