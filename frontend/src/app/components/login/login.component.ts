import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="globe-ring ring-1"></div>
        <div class="globe-ring ring-2"></div>
        <div class="globe-ring ring-3"></div>
        <div class="floating-icon fi-1"><span class="material-icons">flight</span></div>
        <div class="floating-icon fi-2"><span class="material-icons">place</span></div>
        <div class="floating-icon fi-3"><span class="material-icons">explore</span></div>
      </div>

      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">
            <span class="material-icons">public</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to explore the world</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <div class="input-icon-wrap">
              <span class="material-icons input-icon">person</span>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="Username"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="input-icon-wrap">
              <span class="material-icons input-icon">lock</span>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Password"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          @if (error()) {
            <div class="error-msg">
              <span class="material-icons" style="font-size:16px">error</span>
              {{ error() }}
            </div>
          }

          <button type="submit" class="btn-login" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign In
              <span class="material-icons" style="font-size:18px">arrow_forward</span>
            }
          </button>
        </form>

        <div class="signup-link">
          New here? <a routerLink="/signup">Create an account</a>
        </div>

        <div class="demo-section">
          <div class="demo-label">Quick Demo</div>
          <div class="demo-buttons">
            <button class="demo-btn" (click)="fillDemo('admin', 'admin123')">
              <span class="material-icons" style="font-size:14px">admin_panel_settings</span> Admin
            </button>
            <button class="demo-btn" (click)="fillDemo('user', 'user123')">
              <span class="material-icons" style="font-size:14px">person</span> User
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 56px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--gray-900);
      position: relative;
      overflow: hidden;
    }
    .login-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .globe-ring {
      position: absolute;
      border: 1px solid rgba(99,102,241,.12);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-ring 4s ease-in-out infinite;
    }
    .ring-1 { width: 400px; height: 400px; animation-delay: 0s; }
    .ring-2 { width: 600px; height: 600px; animation-delay: 1s; }
    .ring-3 { width: 800px; height: 800px; animation-delay: 2s; }
    @keyframes pulse-ring {
      0%, 100% { opacity: .3; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: .6; transform: translate(-50%, -50%) scale(1.03); }
    }
    .floating-icon {
      position: absolute;
      color: rgba(99,102,241,.25);
      animation: float 6s ease-in-out infinite;
    }
    .floating-icon .material-icons { font-size: 32px; }
    .fi-1 { top: 20%; left: 15%; animation-delay: 0s; }
    .fi-2 { top: 60%; right: 12%; animation-delay: 2s; }
    .fi-3 { bottom: 15%; left: 25%; animation-delay: 4s; }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(5deg); }
    }

    .login-card {
      background: rgba(30,41,59,.8);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 2;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-icon {
      width: 56px;
      height: 56px;
      background: var(--gradient-hero);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: .75rem;
      box-shadow: 0 8px 24px rgba(99,102,241,.3);
    }
    .logo-icon .material-icons { font-size: 28px; color: white; }
    .login-header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
      letter-spacing: -.02em;
    }
    .login-header p {
      color: var(--gray-400);
      margin-top: .25rem;
      font-size: .9rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .input-icon-wrap {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: .85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-500);
      font-size: 20px;
    }
    .input-icon-wrap input {
      width: 100%;
      padding: .75rem 1rem .75rem 2.8rem;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: var(--radius);
      font-size: .95rem;
      background: rgba(255,255,255,.04);
      color: white;
      transition: all .2s;
    }
    .input-icon-wrap input::placeholder {
      color: var(--gray-500);
    }
    .input-icon-wrap input:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(99,102,241,.06);
      box-shadow: 0 0 0 3px rgba(99,102,241,.15);
    }

    .error-msg {
      background: rgba(239,68,68,.12);
      color: #fca5a5;
      padding: .6rem 1rem;
      border-radius: var(--radius);
      font-size: .85rem;
      display: flex;
      align-items: center;
      gap: .4rem;
      border: 1px solid rgba(239,68,68,.2);
    }

    .btn-login {
      background: var(--gradient-hero);
      color: white;
      border: none;
      padding: .8rem;
      border-radius: var(--radius);
      font-size: 1rem;
      font-weight: 700;
      transition: all .25s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      box-shadow: 0 4px 16px rgba(99,102,241,.3);
      margin-top: .25rem;
    }
    .btn-login:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(99,102,241,.4);
    }
    .btn-login:disabled { opacity: .6; }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .signup-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: .88rem;
      color: var(--gray-400);
    }
    .signup-link a {
      color: var(--primary);
      font-weight: 600;
    }
    .signup-link a:hover { text-decoration: underline; }

    .demo-section {
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255,255,255,.06);
    }
    .demo-label {
      text-align: center;
      font-size: .75rem;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 600;
      margin-bottom: .6rem;
    }
    .demo-buttons {
      display: flex;
      gap: .5rem;
    }
    .demo-btn {
      flex: 1;
      padding: .5rem;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      color: var(--gray-300);
      border-radius: var(--radius);
      font-size: .8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .3rem;
      transition: all .2s;
    }
    .demo-btn:hover {
      background: rgba(99,102,241,.1);
      border-color: rgba(99,102,241,.3);
      color: white;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal<string>('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  fillDemo(user: string, pass: string): void {
    this.username = user;
    this.password = pass;
    this.onLogin();
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.error.set('Please enter username and password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectByRole();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid username or password');
      }
    });
  }

  private redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  }
}
