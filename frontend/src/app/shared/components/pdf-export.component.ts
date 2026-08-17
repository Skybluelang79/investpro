import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="export-btn" (click)="exportToPdf()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export PDF
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--color-primary, #2563eb), var(--color-secondary, #7c3aed));
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s ease, box-shadow 0.2s ease;
    }

    .export-btn:hover {
      opacity: 0.9;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }

    .export-btn:active {
      transform: translateY(1px);
    }
  `]
})
export class PdfExportComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'export';
  @Input() title: string = 'Data Export';

  exportToPdf(): void {
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let tableRows = '';
    if (this.data.length > 0) {
      const headers = Object.keys(this.data[0]);
      tableRows += '<thead><tr>';
      headers.forEach(h => {
        tableRows += `<th style="padding:8px 12px;border-bottom:2px solid #e2e8f0;text-align:left;font-weight:600;color:#334155;">${this.escapeHtml(h)}</th>`;
      });
      tableRows += '</tr></thead><tbody>';

      this.data.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        tableRows += `<tr style="background:${bgColor};">`;
        headers.forEach(h => {
          tableRows += `<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">${this.escapeHtml(String(row[h] ?? ''))}</td>`;
        });
        tableRows += '</tr>';
      });
      tableRows += '</tbody>';
    } else {
      tableRows = '<tbody><tr><td style="padding:12px;color:#94a3b8;text-align:center;" colspan="100%">No data available</td></tr></tbody>';
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${this.escapeHtml(this.title)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 40px;
            color: #1e293b;
          }
          h1 {
            font-size: 22px;
            margin-bottom: 4px;
            color: #0f172a;
          }
          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
        </style>
      </head>
      <body>
        <h1>${this.escapeHtml(this.title)}</h1>
        <p class="subtitle">Generated on ${now}</p>
        <table>${tableRows}</table>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
