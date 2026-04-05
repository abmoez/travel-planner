import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../models/destination.model';
import { DestinationMapComponent } from '../destination-map/destination-map.component';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  imports: [DestinationMapComponent],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-ring"></div>
          <p>Loading destination...</p>
        </div>
      } @else if (destination()) {
        <!-- Flag Hero -->
        <div class="hero-banner">
          <img [src]="destination()!.flagUrl" [alt]="destination()!.countryName" class="hero-flag" />
          <div class="hero-overlay">
            <div class="container">
              <button class="back-btn" (click)="goBack()">
                <span class="material-icons">arrow_back</span>
                Back
              </button>
              <div class="hero-info">
                <h1>{{ destination()!.countryName }}</h1>
                <div class="hero-tags">
                  <span class="hero-tag">{{ destination()!.region }}</span>
                  @if (destination()!.subregion) {
                    <span class="hero-tag sub">{{ destination()!.subregion }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="detail-layout">
            <!-- Info Panel -->
            <div class="info-panel">
              <div class="info-card">
                <div class="stat-grid">
                  <div class="stat-item">
                    <div class="stat-icon capital-icon">
                      <span class="material-icons">location_city</span>
                    </div>
                    <div>
                      <span class="stat-label">Capital</span>
                      <span class="stat-value">{{ destination()!.capital }}</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon pop-icon">
                      <span class="material-icons">people</span>
                    </div>
                    <div>
                      <span class="stat-label">Population</span>
                      <span class="stat-value">{{ formatPopulation(destination()!.population) }}</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon currency-icon">
                      <span class="material-icons">payments</span>
                    </div>
                    <div>
                      <span class="stat-label">Currency</span>
                      <span class="stat-value">{{ destination()!.currency }}</span>
                    </div>
                  </div>
                  @if (destination()!.latitude != null) {
                    <div class="stat-item">
                      <div class="stat-icon coord-icon">
                        <span class="material-icons">my_location</span>
                      </div>
                      <div>
                        <span class="stat-label">Coordinates</span>
                        <span class="stat-value">{{ destination()!.latitude!.toFixed(2) }}, {{ destination()!.longitude!.toFixed(2) }}</span>
                      </div>
                    </div>
                  }
                </div>

                <button
                  class="wishlist-btn"
                  [class.active]="destination()!.wantToVisit"
                  (click)="toggleWishlist()">
                  <span class="material-icons">
                    {{ destination()!.wantToVisit ? 'favorite' : 'favorite_border' }}
                  </span>
                  {{ destination()!.wantToVisit ? 'On Your Wishlist' : 'Add to Wishlist' }}
                </button>
              </div>
            </div>

            <!-- Map Panel -->
            @if (destination()!.latitude != null && destination()!.longitude != null) {
              <div class="map-panel">
                <h3 class="map-panel-title">
                  <span class="material-icons">place</span>
                  Location
                </h3>
                <app-destination-map
                  [destinations]="[destination()!]"
                  [mini]="true"
                  [singleMode]="true"
                />
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { padding-bottom: 3rem; }

    .hero-banner {
      position: relative;
      height: 340px;
      overflow: hidden;
    }
    .hero-flag {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15,23,42,.3) 0%, rgba(15,23,42,.85) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.25rem 0;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      background: rgba(255,255,255,.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.15);
      color: white;
      font-size: .85rem;
      font-weight: 600;
      padding: .45rem .9rem;
      border-radius: 50px;
      transition: all .2s;
    }
    .back-btn .material-icons { font-size: 18px; }
    .back-btn:hover { background: rgba(255,255,255,.2); }
    .hero-info {
      margin-top: auto;
      padding-top: 2rem;
    }
    .hero-info h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      letter-spacing: -.03em;
      line-height: 1.1;
    }
    .hero-tags {
      display: flex;
      gap: .4rem;
      margin-top: .65rem;
    }
    .hero-tag {
      background: rgba(99,102,241,.6);
      backdrop-filter: blur(4px);
      color: white;
      padding: .25rem .75rem;
      border-radius: 50px;
      font-size: .78rem;
      font-weight: 600;
    }
    .hero-tag.sub {
      background: rgba(255,255,255,.12);
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: -3rem;
      position: relative;
      z-index: 2;
    }

    .info-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
    }
    .stat-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: .85rem;
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon .material-icons { font-size: 22px; color: white; }
    .capital-icon { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .pop-icon { background: linear-gradient(135deg, #14b8a6, #06b6d4); }
    .currency-icon { background: linear-gradient(135deg, #f59e0b, #f97316); }
    .coord-icon { background: linear-gradient(135deg, #ec4899, #f43f5e); }
    .stat-label {
      display: block;
      font-size: .72rem;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: .06em;
      font-weight: 600;
    }
    .stat-value {
      display: block;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-top: .05rem;
    }

    .wishlist-btn {
      width: 100%;
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      padding: .85rem;
      border: 2px solid var(--gray-200);
      background: white;
      border-radius: var(--radius);
      font-size: .95rem;
      font-weight: 700;
      color: var(--gray-600);
      transition: all .2s;
    }
    .wishlist-btn:hover {
      border-color: var(--danger);
      color: var(--danger);
      background: var(--danger-light);
    }
    .wishlist-btn.active {
      background: var(--danger);
      border-color: var(--danger);
      color: white;
    }

    .map-panel {
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .map-panel-title {
      display: flex;
      align-items: center;
      gap: .4rem;
      font-size: .9rem;
      font-weight: 700;
      color: white;
    }
    .map-panel-title .material-icons { font-size: 20px; color: var(--primary); }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      color: var(--gray-400);
      gap: .75rem;
    }
    .spinner-ring {
      width: 36px;
      height: 36px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .hero-banner { height: 250px; }
      .hero-info h1 { font-size: 1.75rem; }
      .detail-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class DestinationDetailComponent implements OnInit {
  destination = signal<Destination | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destService: DestinationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.destService.getDestinationById(id).subscribe({
      next: dest => {
        this.destination.set(dest);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/user']);
      }
    });
  }

  toggleWishlist(): void {
    const dest = this.destination();
    if (!dest) return;
    this.destService.toggleWantToVisit(dest.id).subscribe({
      next: () => {
        this.destination.set({ ...dest, wantToVisit: !dest.wantToVisit });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }

  formatPopulation(pop: number): string {
    return pop.toLocaleString();
  }
}
