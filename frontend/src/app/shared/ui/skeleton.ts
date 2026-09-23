import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse rounded bg-slate-200/70" [style.height]="height()" [style.width]="width()"></div>
  `,
})
export class UiSkeleton {
  height = input<string>('16px');
  width = input<string>('100%');
}
