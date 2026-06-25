import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-page">
      <!-- Left Panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-icon">🏪</div>
          <h1 class="brand-title">Tiendas Mi Cholo S.A.C.</h1>
          <p class="brand-subtitle">Sistema de Gestión de Abarrotes</p>
          <div class="brand-features">
            <div class="feature">✅ Control de Inventario en tiempo real</div>
            <div class="feature">✅ Reportes PDF automáticos</div>
            <div class="feature">✅ Gestión multi-usuario con roles</div>
            <div class="feature">✅ Panel administrativo completo</div>
          </div>
        </div>
        <div class="brand-gradient"></div>
      </div>

      <!-- Right Panel -->
      <div class="form-panel">
        <div class="login-card">
          <div class="login-header">
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          @if (error()) {
            <div class="alert alert-danger animate-slidein">
              ⚠️ {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label class="form-label">👤 Usuario</label>
              <input formControlName="username" type="text" class="form-control"
                     placeholder="Ingresa tu usuario"
                     [class.is-invalid]="form.get('username')?.invalid && form.get('username')?.touched">
              @if (form.get('username')?.invalid && form.get('username')?.touched) {
                <div class="invalid-feedback">El usuario es requerido</div>
              }
            </div>

            <div class="form-group">
              <label class="form-label">🔒 Contraseña</label>
              <div class="password-wrapper">
                <input formControlName="password" [type]="showPassword() ? 'text' : 'password'"
                       class="form-control" placeholder="Ingresa tu contraseña"
                       [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched">
                <button type="button" class="toggle-password" (click)="showPassword.update(v => !v)">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <div class="invalid-feedback">La contraseña es requerida</div>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100"
                    [disabled]="loading() || form.invalid">
              @if (loading()) {
                <span class="spinner"></span> Ingresando...
              } @else {
                🚀 Ingresar al Sistema
              }
            </button>
          </form>

          <div class="login-hint">
            <small>👨‍💼 Demo: <strong>admin</strong> / <strong>admin123</strong></small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      height: 100vh;
      background: var(--bg-base);
    }

    /* Brand panel */
    .brand-panel {
      flex: 1;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .brand-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.2) 0%, transparent 70%),
                  radial-gradient(ellipse at 70% 20%, rgba(139,92,246,0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .brand-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 40px;
    }

    .brand-icon { font-size: 5rem; margin-bottom: 16px; animation: pulse 3s ease-in-out infinite; }
    .brand-title { font-size: 3rem; font-weight: 800; color: white; letter-spacing: -0.02em; }
    .brand-subtitle { font-size: 1.1rem; color: var(--text-secondary); margin: 8px 0 40px; }

    .brand-features { display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .feature {
      padding: 12px 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-size: 0.875rem;
      transition: var(--transition);
    }
    .feature:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: var(--text-primary); }

    /* Form panel */
    .form-panel {
      width: 460px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--bg-surface);
      border-left: 1px solid var(--border);
    }

    .login-card { width: 100%; animation: slideUp 0.4s ease; }

    .login-header { margin-bottom: 32px; }
    .login-header h2 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .login-header p { color: var(--text-secondary); margin-top: 4px; }

    .login-form { display: flex; flex-direction: column; gap: 4px; }

    .password-wrapper { position: relative; }
    .password-wrapper .form-control { padding-right: 44px; }
    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }

    .login-hint {
      text-align: center;
      margin-top: 20px;
      color: var(--text-muted);
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slidein { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-slidein { animation: slidein 0.3s ease; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Credenciales incorrectas');
        this.loading.set(false);
      }
    });
  }
}
