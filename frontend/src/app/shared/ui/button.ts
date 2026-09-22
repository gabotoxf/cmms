import { Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type UiButtonSize = 'sm' | 'default' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ' +
  'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'disabled:pointer-events-none disabled:opacity-50 shrink-0 cursor-pointer';

const VARIANTS: Record<UiButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
  outline: 'border border-input bg-card hover:bg-muted hover:text-foreground',
  ghost: 'hover:bg-muted hover:text-foreground',
};

const SIZES: Record<UiButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-9 px-4',
  icon: 'size-9',
};

/** Botón estilo shadcn: <button ui-btn variant="destructive" size="sm"> */
@Component({
  selector: 'button[ui-btn], a[ui-btn]',
  standalone: true,
  template: '<ng-content />',
  host: { '[class]': 'cls()' },
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('default');
  readonly size = input<UiButtonSize>('default');
  protected readonly cls = computed(() => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`);
}
