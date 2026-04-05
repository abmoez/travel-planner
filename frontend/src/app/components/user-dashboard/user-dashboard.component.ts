import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../models/destination.model';
import { DestinationMapComponent } from '../destination-map/destination-map.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FormsModule, DestinationMapComponent],
  template: `
    <div class="dashboard">
      <!-- Hero Map Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>Explore the World</h1>
            <p>{{ totalDestinations() }} destinations waiting for you</p>
          </div>
          <div class="hero-actions">
            <div class="view-switcher">
              <button
                class="vs-btn"
                [class.active]="viewMode() === 'map'"
                (click)="switchView('map')">
                <span class="material-icons">map</span> Map
              </button>
              <button
                class="vs-btn"
                [class.active]="viewMode() === 'list'"
                (click)="switchView('list')">
                <span class="material-icons">grid_view</span> Grid
              </button>
            </div>
          </div>
        </div>

        @if (viewMode() === 'map') {
          <div class="hero-map-wrap">
            @if (mapDestinations().length > 0) {
              <app-destination-map
                [destinations]="mapDestinations()"
                (wantToVisitToggle)="onMapWishlistToggle($event)"
                (viewDetail)="viewDetail($event)"
              />
            } @else if (loading()) {
              <div class="map-placeholder">
                <div class="spinner-ring"></div>
                <p>Loading destinations...</p>
              </div>
            } @else {
              <div class="map-placeholder">
                <span class="material-icons" style="font-size:3rem">explore_off</span>
                <p>No destinations available yet</p>
              </div>
            }
          </div>
        }
      </section>

      <div class="container">
        <!-- Tabs Row -->
        <div class="tabs-bar">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab() === 'all'" (click)="switchTab('all')">
              <span class="material-icons">explore</span>
              All
              <span class="tab-count">{{ totalDestinations() }}</span>
            </button>
            <button class="tab" [class.active]="activeTab() === 'wishlist'" (click)="switchTab('wishlist')">
              <span class="material-icons">favorite</span>
              Wishlist
              @if (wishlist().length > 0) {
                <span class="tab-count wish">{{ wishlist().length }}</span>
              }
            </button>
          </div>

          <!-- Search -->
          <div class="search-wrap">
            <span class="material-icons search-icon">search</span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Search countries..."
              (keyup.enter)="search()"
              (input)="onSearchInput()"
            />
            @if (searchTerm) {
              <button class="clear-btn" (click)="clearSearch()">
                <span class="material-icons">close</span>
              </button>
            }
          </div>
        </div>

        @if (activeTab() === 'all') {
          @if (loading() && viewMode() === 'list') {
            <div class="loading-state">
              <div class="spinner-ring"></div>
              <p>Loading destinations...</p>
            </div>
          } @else if (loadError()) {
            <div class="empty-state">
              <span class="material-icons">cloud_off</span>
              <h3>Failed to load destinations</h3>
              <p>Something went wrong. Please try again or re-login if the issue persists.</p>
              <button class="retry-btn" (click)="loadDestinations()">
                <span class="material-icons" style="font-size:18px">refresh</span> Retry
              </button>
            </div>
          } @else if (destinations().length === 0 && !loading()) {
            <div class="empty-state">
              <span class="material-icons">flight</span>
              <h3>No destinations found</h3>
              <p>Try a different search or ask an admin to add destinations</p>
            </div>
          } @else {
            <div class="dest-grid">
              @for (dest of destinations(); track dest.id) {
                <div class="dest-card" (click)="viewDetail(dest.id)">
                  <div class="card-img">
                    <img [src]="dest.flagUrl" [alt]="dest.countryName" loading="lazy" />
                    <div class="card-img-overlay">
                      <span class="region-tag">{{ dest.region }}</span>
                      @if (dest.wantToVisit) {
                        <span class="heart-badge">
                          <span class="material-icons" style="font-size:14px">favorite</span>
                        </span>
                      }
                    </div>
                  </div>
                  <div class="card-body">
                    <h3>{{ dest.countryName }}</h3>
                    <div class="card-details">
                      <div class="detail-chip">
                        <span class="material-icons">location_city</span>
                        {{ dest.capital }}
                      </div>
                      @if (dest.subregion) {
                        <div class="detail-chip">
                          <span class="material-icons">map</span>
                          {{ dest.subregion }}
                        </div>
                      }
                    </div>
                    <div class="card-footer">
                      <span class="pop-label">
                        <span class="material-icons" style="font-size:14px">people</span>
                        {{ formatPopulation(dest.population) }}
                      </span>
                      <button
                        class="btn-heart"
                        [class.active]="dest.wantToVisit"
                        (click)="toggleWishlist($event, dest)"
                        [attr.aria-label]="dest.wantToVisit ? 'Remove from wishlist' : 'Add to wishlist'">
                        <span class="material-icons">{{ dest.wantToVisit ? 'favorite' : 'favorite_border' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            @if (totalPages() > 1) {
              <div class="pagination">
                <button class="pg-btn" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">
                  <span class="material-icons">chevron_left</span>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button class="pg-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p + 1 }}</button>
                }
                <button class="pg-btn" [disabled]="isLastPage()" (click)="goToPage(currentPage() + 1)">
                  <span class="material-icons">chevron_right</span>
                </button>
              </div>
            }
          }
        }

        @if (activeTab() === 'wishlist') {
          @if (wishlist().length === 0) {
            <div class="empty-state">
              <span class="material-icons">favorite_border</span>
              <h3>Your wishlist is empty</h3>
              <p>Click the heart on any destination to start building your travel bucket list</p>
            </div>
          } @else {
            <div class="dest-grid">
              @for (dest of wishlist(); track dest.id) {
                <div class="dest-card" (click)="viewDetail(dest.id)">
                  <div class="card-img">
                    <img [src]="dest.flagUrl" [alt]="dest.countryName" loading="lazy" />
                    <div class="card-img-overlay">
                      <span class="region-tag">{{ dest.region }}</span>
                      <span class="heart-badge">
                        <span class="material-icons" style="font-size:14px">favorite</span>
                      </span>
                    </div>
                  </div>
                  <div class="card-body">
                    <h3>{{ dest.countryName }}</h3>
                    <div class="card-details">
                      <div class="detail-chip">
                        <span class="material-icons">location_city</span>
                        {{ dest.capital }}
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding-bottom: 3rem; }

    /* Hero */
    .hero-section {
      background: var(--gradient-dark);
      padding: 1.75rem 0 0;
      border-bottom: 1px solid rgba(255,255,255,.05);
    }
    .hero-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .hero-text h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: white;
      letter-spacing: -.03em;
    }
    .hero-text p {
      color: var(--gray-400);
      font-size: .9rem;
      margin-top: .15rem;
    }
    .view-switcher {
      display: flex;
      background: rgba(255,255,255,.06);
      border-radius: var(--radius);
      padding: 3px;
      border: 1px solid rgba(255,255,255,.08);
    }
    .vs-btn {
      padding: .5rem 1.1rem;
      border: none;
      background: transparent;
      border-radius: 7px;
      font-size: .82rem;
      font-weight: 600;
      color: var(--gray-400);
      transition: all .2s;
      display: flex;
      align-items: center;
      gap: .35rem;
    }
    .vs-btn .material-icons { font-size: 18px; }
    .vs-btn.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 8px rgba(99,102,241,.3);
    }
    .hero-map-wrap {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem 1.5rem;
    }
    .map-placeholder {
      height: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,.03);
      border-radius: var(--radius-lg);
      color: var(--gray-500);
      gap: .75rem;
      border: 1px dashed rgba(255,255,255,.08);
    }
    .spinner-ring {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(99,102,241,.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    /* Tabs */
    .tabs-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: .75rem;
      margin: 1.75rem 0 1.5rem;
    }
    .tabs {
      display: flex;
      gap: .4rem;
    }
    .tab {
      padding: .55rem 1rem;
      border: 1px solid var(--gray-200);
      background: white;
      border-radius: 50px;
      font-weight: 600;
      font-size: .82rem;
      color: var(--gray-500);
      transition: all .2s;
      display: flex;
      align-items: center;
      gap: .35rem;
    }
    .tab .material-icons { font-size: 18px; }
    .tab.active {
      background: var(--gray-900);
      color: white;
      border-color: var(--gray-900);
    }
    .tab:hover:not(.active) { background: var(--gray-100); }
    .tab-count {
      background: var(--gray-200);
      color: var(--gray-600);
      padding: .05rem .45rem;
      border-radius: 50px;
      font-size: .7rem;
      font-weight: 700;
    }
    .tab.active .tab-count { background: rgba(255,255,255,.15); color: white; }
    .tab-count.wish { background: var(--danger); color: white; }
    .tab.active .tab-count.wish { background: var(--danger); }

    /* Search */
    .search-wrap {
      position: relative;
      width: 280px;
    }
    .search-wrap input {
      width: 100%;
      padding: .6rem .85rem .6rem 2.5rem;
      border: 1px solid var(--gray-200);
      border-radius: 50px;
      font-size: .88rem;
      background: white;
      transition: all .2s;
    }
    .search-wrap input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .search-icon {
      position: absolute;
      left: .85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
      font-size: 20px;
    }
    .clear-btn {
      position: absolute;
      right: .5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--gray-400);
      padding: .2rem;
    }

    /* Cards */
    .dest-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .dest-card {
      background: white;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
      cursor: pointer;
      border: 1px solid var(--gray-100);
    }
    .dest-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--primary-light);
    }
    .card-img {
      position: relative;
      height: 170px;
      overflow: hidden;
    }
    .card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .4s;
    }
    .dest-card:hover .card-img img {
      transform: scale(1.05);
    }
    .card-img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.4) 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: .6rem;
    }
    .region-tag {
      background: rgba(15,23,42,.7);
      backdrop-filter: blur(4px);
      color: white;
      padding: .2rem .6rem;
      border-radius: 50px;
      font-size: .68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .heart-badge {
      background: var(--danger);
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(239,68,68,.3);
    }
    .card-body {
      padding: 1rem 1rem .85rem;
    }
    .card-body h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: .5rem;
      letter-spacing: -.01em;
    }
    .card-details {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
    }
    .detail-chip {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      background: var(--gray-100);
      color: var(--gray-600);
      padding: .2rem .55rem;
      border-radius: 50px;
      font-size: .75rem;
      font-weight: 500;
    }
    .detail-chip .material-icons { font-size: 14px; color: var(--gray-400); }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .7rem;
      padding-top: .65rem;
      border-top: 1px solid var(--gray-100);
    }
    .pop-label {
      display: flex;
      align-items: center;
      gap: .25rem;
      font-size: .78rem;
      color: var(--gray-400);
      font-weight: 500;
    }
    .btn-heart {
      background: none;
      border: none;
      color: var(--gray-300);
      transition: all .2s;
      padding: .3rem;
      border-radius: 50%;
    }
    .btn-heart .material-icons { font-size: 22px; }
    .btn-heart.active { color: var(--danger); }
    .btn-heart:hover { color: var(--danger); transform: scale(1.15); }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      gap: .35rem;
      margin-top: 2.5rem;
    }
    .pg-btn {
      padding: .5rem .75rem;
      border: 1px solid var(--gray-200);
      background: white;
      border-radius: var(--radius);
      font-size: .85rem;
      font-weight: 500;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      transition: all .15s;
    }
    .pg-btn.active {
      background: var(--gray-900);
      color: white;
      border-color: var(--gray-900);
    }
    .pg-btn:disabled { opacity: .35; cursor: not-allowed; }
    .pg-btn:hover:not(:disabled):not(.active) { background: var(--gray-100); }

    /* States */
    .loading-state {
      text-align: center;
      padding: 5rem 2rem;
      color: var(--gray-400);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .75rem;
    }
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      color: var(--gray-400);
    }
    .empty-state .material-icons {
      font-size: 4rem;
      color: var(--gray-300);
      margin-bottom: .5rem;
    }
    .empty-state h3 {
      font-size: 1.15rem;
      color: var(--gray-600);
      margin-bottom: .25rem;
    }
    .retry-btn {
      margin-top: 1rem;
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .6rem 1.25rem;
      border: 1px solid var(--primary);
      background: var(--primary);
      color: white;
      border-radius: 50px;
      font-size: .88rem;
      font-weight: 600;
      transition: all .2s;
    }
    .retry-btn:hover {
      opacity: .9;
      transform: translateY(-1px);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .hero-text h1 { font-size: 1.35rem; }
      .tabs-bar { flex-direction: column; align-items: stretch; }
      .search-wrap { width: 100%; }
      .dest-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  searchTerm = '';
  destinations = signal<Destination[]>([]);
  mapDestinations = signal<Destination[]>([]);
  wishlist = signal<Destination[]>([]);
  loading = signal(true);
  loadError = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  totalDestinations = signal(0);
  isLastPage = signal(false);
  activeTab = signal<'all' | 'wishlist'>('all');
  viewMode = signal<'map' | 'list'>('map');
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private mapLoaded = false;

  constructor(
    private destService: DestinationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadAllForMap();
    this.loadWishlist();
  }

  switchView(mode: 'map' | 'list'): void {
    this.viewMode.set(mode);
    if (mode === 'map' && !this.mapLoaded) {
      this.loadAllForMap();
    }
  }

  switchTab(tab: 'all' | 'wishlist'): void {
    this.activeTab.set(tab);
    if (tab === 'all') {
      this.loadDestinations();
    } else {
      this.loadWishlist();
    }
  }

  loadDestinations(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.destService.getApprovedDestinations(this.currentPage(), 12, this.searchTerm || undefined).subscribe({
      next: res => {
        this.destinations.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalDestinations.set(res.totalElements);
        this.isLastPage.set(res.last);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  private loadAllForMap(): void {
    this.destService.getApprovedDestinations(0, 1000).subscribe({
      next: res => {
        this.mapDestinations.set(res.content);
        this.mapLoaded = true;
        if (this.totalDestinations() === 0) {
          this.totalDestinations.set(res.totalElements);
        }
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  loadWishlist(): void {
    this.destService.getWantToVisitList().subscribe({
      next: data => this.wishlist.set(data)
    });
  }

  search(): void {
    this.currentPage.set(0);
    this.loadDestinations();
    if (this.viewMode() === 'map') {
      this.destService.getApprovedDestinations(0, 1000, this.searchTerm || undefined).subscribe({
        next: res => this.mapDestinations.set(res.content)
      });
    }
  }

  onSearchInput(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.search(), 400);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadDestinations();
  }

  pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  viewDetail(id: number): void {
    this.router.navigate(['/user/destination', id]);
  }

  toggleWishlist(event: Event, dest: Destination): void {
    event.stopPropagation();
    this.destService.toggleWantToVisit(dest.id).subscribe({
      next: () => this.applyWishlistToggle(dest)
    });
  }

  onMapWishlistToggle(dest: Destination): void {
    this.destService.toggleWantToVisit(dest.id).subscribe({
      next: () => this.applyWishlistToggle(dest)
    });
  }

  private applyWishlistToggle(dest: Destination): void {
    const newState = !dest.wantToVisit;

    this.destinations.set(
      this.destinations().map(d =>
        d.id === dest.id ? { ...d, wantToVisit: newState } : d
      )
    );

    this.mapDestinations.set(
      this.mapDestinations().map(d =>
        d.id === dest.id ? { ...d, wantToVisit: newState } : d
      )
    );

    if (newState) {
      if (!this.wishlist().some(d => d.id === dest.id)) {
        this.wishlist.set([...this.wishlist(), { ...dest, wantToVisit: true }]);
      }
    } else {
      this.wishlist.set(this.wishlist().filter(d => d.id !== dest.id));
    }
  }

  formatPopulation(pop: number): string {
    if (pop >= 1_000_000) return (pop / 1_000_000).toFixed(1) + 'M';
    if (pop >= 1_000) return (pop / 1_000).toFixed(0) + 'K';
    return pop.toString();
  }
}
