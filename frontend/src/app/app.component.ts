import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <a routerLink="/" class="nav-brand">
          <div class="brand-icon">
            <span class="material-icons">public</span>
          </div>
          <span class="brand-text">TravelPlanner</span>
        </a>
        @if (auth.isLoggedIn()) {
          <div class="nav-right">
            <div class="nav-user-pill">
              <span class="material-icons" style="font-size:18px">person</span>
              <span class="nav-username">{{ auth.username() }}</span>
              <span class="nav-role">{{ auth.role() }}</span>
            </div>
            <button class="btn-logout" (click)="auth.logout()">
              <span class="material-icons" style="font-size:18px">logout</span>
            </button>
          </div>
        }
      </div>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      background: rgba(15,23,42,.92);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: white;
      padding: .65rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .nav-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      color: white;
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: .65rem;
      letter-spacing: -.02em;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: var(--gradient-hero);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-icon .material-icons {
      font-size: 20px;
      color: white;
    }
    .brand-text {
      background: linear-gradient(135deg, #e0e7ff, #fff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .nav-user-pill {
      display: flex;
      align-items: center;
      gap: .45rem;
      background: rgba(255,255,255,.08);
      padding: .35rem .75rem .35rem .55rem;
      border-radius: 50px;
      font-size: .85rem;
    }
    .nav-username {
      font-weight: 500;
      color: rgba(255,255,255,.9);
    }
    .nav-role {
      background: var(--primary);
      padding: .1rem .5rem;
      border-radius: 50px;
      font-size: .65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .btn-logout {
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.7);
      border: 1px solid rgba(255,255,255,.1);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .2s;
    }
    .btn-logout:hover {
      background: rgba(239,68,68,.2);
      border-color: rgba(239,68,68,.4);
      color: #fca5a5;
    }
    main {
      min-height: calc(100vh - 56px);
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
