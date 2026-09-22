import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
      <div class="min-w-0 flex-1 max-w-[50%]">
        @if (kicker()) {
          <div class="flex items-center gap-2 text-[11px] font-mono font-medium tracking-wider uppercase text-teal-800">
            <span>{{ kicker() }}</span>
            <span class="text-slate-300">·</span>
            <span class="text-slate-500">{{ kickerSuffix() }}</span>
          </div>
        }
        <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-primary-950)] mt-1.5" style="font-family:'Montserrat',sans-serif">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-slate-500 leading-relaxed">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class UiPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly kicker = input<string>('');
  readonly kickerSuffix = input<string>('');
}
