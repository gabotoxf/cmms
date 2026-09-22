import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput } from '../../shared/ui/field';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, UiButton, UiCard, UiInput],
  template: `
    <div class="mx-auto mt-16 max-w-sm">
      <ui-card title="CMMS — Iniciar sesión" desc="Gestión de mantenimiento biomédico">
        <div class="grid gap-3">
          <input ui-input [(ngModel)]="email" placeholder="email" />
          <input ui-input [(ngModel)]="password" type="password" placeholder="contraseña" />
          <button ui-btn (click)="entrar()" [disabled]="cargando()">Entrar</button>
          <small class="text-muted-foreground">admin@cmms.local / admin123</small>
        </div>
      </ui-card>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  email = 'admin@cmms.local';
  password = 'admin123';
  readonly cargando = signal(false);

  entrar(): void {
    this.cargando.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.toast.error('No se pudo entrar', 'Credenciales inválidas');
        this.cargando.set(false);
      },
    });
  }
}
