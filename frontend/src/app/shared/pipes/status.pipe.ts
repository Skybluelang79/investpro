import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true,
})
export class StatusBadgePipe implements PipeTransform {
  transform(value?: string | null): string {
    switch (value) {
      case 'completed':
      case 'approved':
      case 'active':
        return 'success';
      case 'pending':
        return 'pending';
      case 'rejected':
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }
}

@Pipe({
  name: 'investmentStatusBadge',
  standalone: true,
})
export class InvestmentStatusBadgePipe implements PipeTransform {
  transform(value?: string | null): string {
    return value ?? '';
  }
}

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
  }
}

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value?: string | null, limit = 18): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
