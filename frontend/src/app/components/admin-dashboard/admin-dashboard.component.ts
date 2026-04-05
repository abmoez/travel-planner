import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../services/destination.service';
import { CountryApiResponse, Destination } from '../../models/destination.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="dashboard">
      <div class="container">
        <header class="dash-header">
          <h1>Admin Dashboard</h1>
          <p>Manage travel destinations from REST Countries API</p>
        </header>

        <!-- Search & Fetch -->
        <section class="card search-section">
          <h2>
            <span class="material-icons">public</span>
            Fetch Countries
          </h2>
          <div class="search-row">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Search country by name..."
              (keyup.enter)="searchCountries()"
            />
            <button class="btn btn-primary" (click)="searchCountries()" [disabled]="fetchingSearch()">
              Search
            </button>
            <button class="btn btn-secondary" (click)="fetchAll()" [disabled]="fetchingAll()">
              @if (fetchingAll()) { Loading... } @else { Fetch All }
            </button>
          </div>

          @if (apiCountries().length > 0) {
            <div class="bulk-bar">
              <span>{{ selectedCountries().length }} selected</span>
              <button class="btn btn-accent" (click)="bulkAdd()" [disabled]="selectedCountries().length === 0">
                Bulk Add Selected
              </button>
            </div>

            <div class="country-grid">
              @for (country of apiCountries(); track country.name.common) {
                <div class="country-card">
                  <div class="country-card-top">
                    <input
                      type="checkbox"
                      [checked]="isSelected(country)"
                      (change)="toggleSelection(country)"
                    />
                    <img [src]="country.flags.png" [alt]="country.name.common" class="flag-sm" />
                    <div class="country-info">
                      <strong>{{ country.name.common }}</strong>
                      <small>{{ country.region }} &bull; {{ extractCapital(country) }}</small>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-primary" (click)="addSingle(country)">
                    <span class="material-icons" style="font-size:16px">add</span> Add
                  </button>
                </div>
              }
            </div>
          }
        </section>

        <!-- Current Destinations -->
        <section class="card">
          <h2>
            <span class="material-icons">place</span>
            Saved Destinations ({{ destinations().length }})
          </h2>

          @if (destinations().length === 0) {
            <p class="empty-msg">No destinations added yet. Fetch countries above to get started.</p>
          } @else {
            <div class="dest-table">
              <div class="dest-header">
                <span>Flag</span>
                <span>Country</span>
                <span>Capital</span>
                <span>Region</span>
                <span>Population</span>
                <span>Actions</span>
              </div>
              @for (dest of destinations(); track dest.id) {
                <div class="dest-row">
                  <img [src]="dest.flagUrl" [alt]="dest.countryName" class="flag-sm" />
                  <span>{{ dest.countryName }}</span>
                  <span>{{ dest.capital }}</span>
                  <span>{{ dest.region }}</span>
                  <span>{{ formatPopulation(dest.population) }}</span>
                  <button class="btn btn-sm btn-danger" (click)="remove(dest.id)">
                    <span class="material-icons" style="font-size:16px">delete</span>
                  </button>
                </div>
              }
            </div>
          }
        </section>

        @if (message()) {
          <div class="toast" [class.toast-error]="isError()">{{ message() }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem 0; }
    .dash-header {
      margin-bottom: 2rem;
    }
    .dash-header h1 {
      font-size: 1.75rem;
      color: var(--gray-900);
    }
    .dash-header p {
      color: var(--gray-500);
      margin-top: .25rem;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      margin-bottom: 1.5rem;
    }
    .card h2 {
      font-size: 1.15rem;
      color: var(--gray-800);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .card h2 .material-icons {
      color: var(--primary);
    }
    .search-row {
      display: flex;
      gap: .75rem;
      margin-bottom: 1rem;
    }
    .search-row input {
      flex: 1;
      padding: .6rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius);
      font-size: .9rem;
    }
    .search-row input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }
    .btn {
      padding: .55rem 1.25rem;
      border: none;
      border-radius: var(--radius);
      font-weight: 500;
      font-size: .875rem;
      transition: all .2s;
      display: inline-flex;
      align-items: center;
      gap: .35rem;
    }
    .btn-sm { padding: .35rem .75rem; font-size: .8rem; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-secondary { background: var(--gray-200); color: var(--gray-700); }
    .btn-secondary:hover { background: var(--gray-300); }
    .btn-accent { background: var(--accent); color: white; }
    .btn-accent:hover { background: #d97706; }
    .btn-danger { background: var(--danger); color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }

    .bulk-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .75rem 1rem;
      background: var(--primary-light);
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-size: .9rem;
      color: var(--primary-dark);
    }

    .country-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: .75rem;
      max-height: 500px;
      overflow-y: auto;
    }
    .country-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .75rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius);
      transition: border-color .2s;
    }
    .country-card:hover {
      border-color: var(--primary);
    }
    .country-card-top {
      display: flex;
      align-items: center;
      gap: .75rem;
    }
    .flag-sm {
      width: 36px;
      height: 24px;
      object-fit: cover;
      border-radius: 3px;
      box-shadow: var(--shadow-sm);
    }
    .country-info {
      display: flex;
      flex-direction: column;
    }
    .country-info strong { font-size: .9rem; }
    .country-info small { color: var(--gray-500); font-size: .75rem; }

    .dest-table {
      overflow-x: auto;
    }
    .dest-header, .dest-row {
      display: grid;
      grid-template-columns: 50px 1.5fr 1fr 1fr 1fr 80px;
      gap: .75rem;
      align-items: center;
      padding: .6rem .5rem;
    }
    .dest-header {
      font-weight: 600;
      font-size: .8rem;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: .05em;
      border-bottom: 2px solid var(--gray-200);
    }
    .dest-row {
      border-bottom: 1px solid var(--gray-100);
      font-size: .9rem;
    }
    .dest-row:hover {
      background: var(--gray-50);
    }

    .empty-msg {
      text-align: center;
      color: var(--gray-400);
      padding: 2rem;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--success);
      color: white;
      padding: .75rem 1.5rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      animation: slideIn .3s ease;
      z-index: 1000;
    }
    .toast-error { background: var(--danger); }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  searchTerm = '';
  apiCountries = signal<CountryApiResponse[]>([]);
  destinations = signal<Destination[]>([]);
  selectedCountries = signal<CountryApiResponse[]>([]);
  fetchingAll = signal(false);
  fetchingSearch = signal(false);
  message = signal('');
  isError = signal(false);

  constructor(private destService: DestinationService) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  fetchAll(): void {
    this.fetchingAll.set(true);
    this.destService.fetchAllCountries().subscribe({
      next: data => {
        this.apiCountries.set(data);
        this.selectedCountries.set([]);
        this.fetchingAll.set(false);
      },
      error: () => {
        this.showMessage('Failed to fetch countries', true);
        this.fetchingAll.set(false);
      }
    });
  }

  searchCountries(): void {
    if (!this.searchTerm.trim()) return;
    this.fetchingSearch.set(true);
    this.destService.searchCountries(this.searchTerm).subscribe({
      next: data => {
        this.apiCountries.set(data);
        this.selectedCountries.set([]);
        this.fetchingSearch.set(false);
      },
      error: () => {
        this.showMessage('No countries found', true);
        this.fetchingSearch.set(false);
        this.apiCountries.set([]);
      }
    });
  }

  addSingle(country: CountryApiResponse): void {
    this.destService.addDestination(country).subscribe({
      next: () => {
        this.showMessage(`${country.name.common} added successfully`);
        this.loadDestinations();
      },
      error: (err) => this.showMessage(err.error?.message || 'Failed to add destination', true)
    });
  }

  bulkAdd(): void {
    const names = this.selectedCountries().map(c => c.name.common);
    this.destService.bulkAddDestinations({ countryNames: names }).subscribe({
      next: (added) => {
        this.showMessage(`${added.length} destinations added`);
        this.selectedCountries.set([]);
        this.loadDestinations();
      },
      error: () => this.showMessage('Bulk add failed', true)
    });
  }

  remove(id: number): void {
    this.destService.removeDestination(id).subscribe({
      next: () => {
        this.showMessage('Destination removed');
        this.loadDestinations();
      },
      error: () => this.showMessage('Failed to remove', true)
    });
  }

  toggleSelection(country: CountryApiResponse): void {
    const current = this.selectedCountries();
    const idx = current.findIndex(c => c.name.common === country.name.common);
    if (idx >= 0) {
      this.selectedCountries.set([...current.slice(0, idx), ...current.slice(idx + 1)]);
    } else {
      this.selectedCountries.set([...current, country]);
    }
  }

  isSelected(country: CountryApiResponse): boolean {
    return this.selectedCountries().some(c => c.name.common === country.name.common);
  }

  extractCapital(country: CountryApiResponse): string {
    return country.capital?.length ? country.capital[0] : 'N/A';
  }

  formatPopulation(pop: number): string {
    if (pop >= 1_000_000) return (pop / 1_000_000).toFixed(1) + 'M';
    if (pop >= 1_000) return (pop / 1_000).toFixed(0) + 'K';
    return pop.toString();
  }

  private loadDestinations(): void {
    this.destService.getAllDestinations().subscribe({
      next: data => this.destinations.set(data),
      error: () => {}
    });
  }

  private showMessage(msg: string, error = false): void {
    this.message.set(msg);
    this.isError.set(error);
    setTimeout(() => this.message.set(''), 3000);
  }
}
