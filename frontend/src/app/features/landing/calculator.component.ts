import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="calculator">
      <div class="calc-header">
        <h2>Investment Calculator</h2>
        <p>Calculate your potential returns in real time</p>
      </div>

      <div class="calc-body">
        <div class="inputs-panel">
          <div class="input-group">
            <div class="input-label">
              <span>Investment Amount</span>
              <span class="input-value">{{ amount | number }} USD</span>
            </div>
            <input type="range" min="100" max="100000" step="100" [(ngModel)]="amount" class="slider" />
          </div>

          <div class="input-group">
            <div class="input-label">
              <span>Plan Duration</span>
              <span class="input-value">{{ days }} days</span>
            </div>
            <input type="range" min="1" max="365" step="1" [(ngModel)]="days" class="slider" />
          </div>

          <div class="input-group">
            <div class="input-label">
              <span>Daily Return Rate</span>
              <span class="input-value">{{ rate }}%</span>
            </div>
            <input type="range" min="0.1" max="10" step="0.1" [(ngModel)]="rate" class="slider" />
          </div>
        </div>

        <div class="results-panel">
          <div class="result-card">
            <span class="result-label">Daily Profit</span>
            <span class="result-value">{{ dailyProfit | number:'1.2-2' }} USD</span>
          </div>
          <div class="result-card">
            <span class="result-label">Total Profit</span>
            <span class="result-value highlight">{{ totalProfit | number:'1.2-2' }} USD</span>
          </div>
          <div class="result-card">
            <span class="result-label">Total Return</span>
            <span class="result-value">{{ totalReturn | number:'1.2-2' }} USD</span>
          </div>
          <div class="result-card">
            <span class="result-label">ROI</span>
            <span class="result-value roi">{{ roi | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .calculator {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .calc-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .calc-header h2 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
    }

    .calc-header p {
      margin: 0;
      color: var(--text-muted);
      font-size: 15px;
    }

    .calc-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 32px;
    }

    .inputs-panel {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .input-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: var(--text-muted);
    }

    .input-value {
      font-weight: 600;
      color: var(--text);
      font-size: 15px;
    }

    .slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--bg);
      outline: none;
      cursor: pointer;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary);
      border: 3px solid var(--card);
      box-shadow: 0 0 0 2px var(--primary);
      cursor: pointer;
      transition: transform 0.15s;
    }

    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }

    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary);
      border: 3px solid var(--card);
      box-shadow: 0 0 0 2px var(--primary);
      cursor: pointer;
    }

    .results-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .result-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--bg-soft), var(--bg));
      border: 1px solid var(--card-border);
    }

    .result-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
    }

    .result-value.highlight {
      color: var(--success);
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04));
      border-radius: 8px;
      padding: 4px 8px;
      margin: -4px -8px;
    }

    .result-value.roi {
      color: var(--primary);
    }

    @media (max-width: 768px) {
      .calc-body {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CalculatorComponent {
  amount = 5000;
  days = 30;
  rate = 2.5;

  get dailyProfit(): number {
    return this.amount * this.rate / 100;
  }

  get totalProfit(): number {
    return this.dailyProfit * this.days;
  }

  get totalReturn(): number {
    return this.amount + this.totalProfit;
  }

  get roi(): number {
    return this.totalProfit / this.amount * 100;
  }
}
