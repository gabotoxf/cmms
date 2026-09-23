import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './shared/ui/toast';
import { Loader } from './shared/ui/loader';

/** Shell raíz: outlet + toasts + loader global. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, Loader],
  template: '<app-loader /><router-outlet /><app-toasts />',
  styles: [':host { display: block; height: 100%; }']
})
export class App {}
