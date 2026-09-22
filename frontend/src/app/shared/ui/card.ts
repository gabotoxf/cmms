import { Component, input } from '@angular/core';

/** Tarjeta estilo shadcn: <ui-card title=".." desc="..">contenido</ui-card> */
@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div class="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      @if (title() || desc()) {
        <div class="flex flex-col gap-1.5 p-6 pb-2">
          @if (title()) { <h3 class="font-semibold leading-none tracking-tight">{{ title() }}</h3> }
          @if (desc()) { <p class="text-sm text-muted-foreground">{{ desc() }}</p> }
        </div>
      }
      <div class="p-6" [class.pt-2]="title() || desc()"><ng-content /></div>
    </div>
  `,
})
export class UiCard {
  readonly title = input('');
  readonly desc = input('');
}
