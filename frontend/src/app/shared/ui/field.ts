import { Directive } from '@angular/core';

/** Input estilo shadcn: <input ui-input /> · <select ui-input> · <textarea ui-input> */
@Directive({
  selector: 'input[ui-input], select[ui-input], textarea[ui-input]',
  standalone: true,
  host: {
    class:
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ' +
      'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 text-foreground',
  },
})
export class UiInput {}

/** Label estilo shadcn: <label ui-label> */
@Directive({
  selector: 'label[ui-label]',
  standalone: true,
  host: {
    class: 'text-sm font-medium leading-none flex flex-col gap-1.5',
  },
})
export class UiLabel {}
