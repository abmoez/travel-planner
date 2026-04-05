import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="signup-page">
      <div class="login-bg">
        <div class="globe-ring ring-1"></div>
        <div class="globe-ring ring-2"></div>
        <div class="globe-ring ring-3"></div>
      </div>

      <div class="signup-card">
        <div class="signup-header">
          <div class="logo-icon">
            <span class="material-icons">person_add</span>
          </div>
          <h1>Create Account</h1>
          <p>Join and start exploring the world</p>
        </div>

        <form (ngSubmit)="onSignup()" class="signup-form">
          <div class="form-group">
            <div class="input-icon-wrap">
              <span class="material-icons input-icon">person</span>
              <input
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
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Password (min 6 characters)"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="input-icon-wrap">
              <span class="material-icons input-icon">lock_outline</span>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="role-selector">
              <button type="button" class="role-btn" [class.active]="role === 'USER'" (click)="role = 'USER'">
                <span class="material-icons" style="font-size:18px">person</span> User
              </button>
              <button type="button" class="role-btn" [class.active]="role === 'ADMIN'" (click)="role = 'ADMIN'">
                <span class="material-icons" style="font-size:18px">admin_panel_settings</span> Admin
              </button>
            </div>
          </div>

          @if (error()) {
            <div class="error-msg">
              <span class="material-icons" style="font-size:16px">error</span>
              {{ error() }}
            </div>
          }

          <button type="submit" class="btn-signup" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Creating...
            } @else {
              Create Account
              <span class="material-icons" style="font-size:18px">arrow_forward</span>
            }
          </button>
        </form>

        <div class="login-link">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-page {
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
      border: 1px solid rgba(99,102,241,.1);
      border-radius: 50%;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-ring 4s ease-in-out infinite;
    }
    .ring-1 { width: 400px; height: 400px; }
    .ring-2 { width: 600px; height: 600px; animation-delay: 1s; }
    .ring-3 { width: 800px; height: 800px; animation-delay: 2s; }
    @keyframes pulse-ring {
      0%, 100% { opacity: .3; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: .6; transform: translate(-50%, -50%) scale(1.03); }
    }

    .signup-card {
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
    .signup-header {
      text-align: center;
      margin-bottom: 1.75rem;
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
    .signup-header h1 { font-size: 1.5rem; font-weight: 800; color: white; }
    .signup-header p { color: var(--gray-400); margin-top: .25rem; font-size: .9rem; }

    .signup-form { display: flex; flex-direction: column; gap: .85rem; }
    .input-icon-wrap { position: relative; }
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
    .input-icon-wrap input::placeholder { color: var(--gray-500); }
    .input-icon-wrap input:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(99,102,241,.06);
      box-shadow: 0 0 0 3px rgba(99,102,241,.15);
    }

    .role-selector {
      display: flex;
      gap: .4rem;
    }
    .role-btn {
      flex: 1;
      padding: .6rem;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      color: var(--gray-400);
      border-radius: var(--radius);
      font-size: .85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .3rem;
      transition: all .2s;
    }
    .role-btn.active {
      background: rgba(99,102,241,.15);
      border-color: var(--primary);
      color: white;
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

    .btn-signup {
      background: var(--gradient-hero);
      color: white;
      border: none;
      padding: .8rem;
      border-radius: var(--radius);
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      box-shadow: 0 4px 16px rgba(99,102,241,.3);
      transition: all .25s;
      margin-top: .25rem;
    }
    .btn-signup:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(99,102,241,.4);
    }
    .btn-signup:disabled { opacity: .6; }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .login-link {
      text-align: center;
      margin-top: 1.25rem;
      font-size: .88rem;
      color: var(--gray-400);
    }
    .login-link a { color: var(--primary); font-weight: 600; }
    .login-link a:hover { text-decoration: underline; }
  `]
})
export class SignupComponent {
  username = '';
  password = '';
  confirmPassword = '';
  role = 'USER';
  error = signal<string>('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  onSignup(): void {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.error.set('All fields are required');
      return;
    }
    if (this.username.length < 3) {
      this.error.set('Username must be at least 3 characters');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register({
      username: this.username,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectByRole();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Username may already be taken.');
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
