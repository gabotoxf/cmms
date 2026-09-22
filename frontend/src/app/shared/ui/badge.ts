import { Component, computed, input } from '@angular/core';

export type UiBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warn';

const BASE =
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap';

const VARIANTS: Record<UiBadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'text-foreground',
  success: 'border-transparent bg-green-100 text-green-800',
  warn: 'border-transparent bg-amber-100 text-amber-800',
};

/** Insignia estilo shadcn: <ui-badge variant="success">OPERATIVO</ui-badge> */
@Component({
  selector: 'ui-badge',
  standalone: true,
  template: '<ng-content />',
  host: { '[class]': 'cls()' },
})
export class UiBadge {
  readonly variant = input<UiBadgeVariant>('default');
  protected readonly cls = computed(() => `${BASE} ${VARIANTS[this.variant()]}`);
}
