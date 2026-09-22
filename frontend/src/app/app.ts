import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './shared/ui/toast';

/** Shell raíz: outlet + toasts globales. La estructura visual vive en Layout. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent],
  template: '<router-outlet /><app-toasts />',
  styles: [':host { display: block; height: 100%; }']
})
export class App {}
