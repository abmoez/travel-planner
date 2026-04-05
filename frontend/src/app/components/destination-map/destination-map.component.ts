import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, AfterViewInit, OnDestroy,
  ElementRef, ViewChild, signal
} from '@angular/core';
import * as L from 'leaflet';
import * as topojson from 'topojson-client';
import { Destination } from '../../models/destination.model';

interface MarkerIconOptions {
  highlighted?: boolean;
  wishlisted?: boolean;
}

function createLabelIcon(name: string, opts: MarkerIconOptions = {}): L.DivIcon {
  const width = Math.max(name.length * 7 + 20, 60);
  let cls = 'country-marker';
  if (opts.wishlisted) cls += ' marker-wishlisted';
  if (opts.highlighted) cls += ' marker-highlighted';
  return L.divIcon({
    className: cls,
    html: `<div class="marker-pin"></div><span class="marker-label">${name}</span>`,
    iconSize: [width, 36],
    iconAnchor: [width / 2, 8],
    popupAnchor: [0, -8]
  });
}

@Component({
  selector: 'app-destination-map',
  standalone: true,
  template: `
    <div class="map-wrapper" [class.mini]="mini">
      <div #mapContainer class="map-container"></div>
      @if (mapLoading()) {
        <div class="map-loading">
          <div class="spinner-ring"></div>
          <p>Rendering map...</p>
        </div>
      }
      @if (!mini && destinations.length > 0) {
        <div class="map-overlay-stats">
          <span class="material-icons" style="font-size:16px">place</span>
          {{ mappableCount }} destinations on map
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      background: var(--gray-900);
      border: 1px solid rgba(255,255,255,.06);
    }
    .map-wrapper.mini {
      border-radius: var(--radius);
    }
    .map-container {
      height: 620px;
      width: 100%;
      z-index: 1;
    }
    .mini .map-container {
      height: 280px;
    }
    .map-loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(15,23,42,.9);
      z-index: 2;
      color: var(--gray-400);
      gap: .75rem;
    }
    .spinner-ring {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(99,102,241,.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    .map-overlay-stats {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      background: rgba(15,23,42,.85);
      backdrop-filter: blur(8px);
      color: white;
      padding: .4rem .85rem;
      border-radius: 50px;
      font-size: .78rem;
      font-weight: 600;
      z-index: 5;
      display: flex;
      align-items: center;
      gap: .35rem;
      border: 1px solid rgba(255,255,255,.1);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .map-container { height: 450px; }
      .mini .map-container { height: 200px; }
    }
  `]
})
export class DestinationMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() destinations: Destination[] = [];
  @Input() mini = false;
  @Input() singleMode = false;
  @Input() adminMode = false;
  @Output() wantToVisitToggle = new EventEmitter<Destination>();
  @Output() viewDetail = new EventEmitter<number>();

  mapLoading = signal(true);
  mappableCount = 0;

  private map: L.Map | null = null;
  private wishlistHighlightsLayer = L.layerGroup();
  private markersLayer = L.layerGroup();
  private hoverHighlightLayer: L.GeoJSON | null = null;
  private activeMarker: L.Marker | null = null;
  private activeDest: Destination | null = null;

  private static countriesGeoData: { features: any[] } | null = null;
  private static geoDataPromise: Promise<void> | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['destinations'] && this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const zoom = this.mini ? 3 : 2;
    const interactive = !this.mini || this.singleMode;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20, 0],
      zoom,
      minZoom: 2,
      maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
      maxBoundsViscosity: 1.0,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      noWrap: true,
      maxZoom: 18
    }).addTo(this.map);

    this.wishlistHighlightsLayer.addTo(this.map);
    this.markersLayer.addTo(this.map);

    this.mapLoading.set(false);
    this.loadCountryBoundaries().then(() => {
      this.updateWishlistHighlights();
    });
    this.updateMarkers();
  }

  private async loadCountryBoundaries(): Promise<void> {
    if (DestinationMapComponent.countriesGeoData) return;

    if (!DestinationMapComponent.geoDataPromise) {
      DestinationMapComponent.geoDataPromise = fetch('assets/world/countries-110m.json')
        .then(res => res.json())
        .then((topology: any) => {
          const geo = topojson.feature(topology, topology.objects.countries);
          DestinationMapComponent.countriesGeoData = geo as any;
        })
        .catch(() => {
          DestinationMapComponent.geoDataPromise = null;
        });
    }

    await DestinationMapComponent.geoDataPromise;
  }

  private findCountryFeature(countryName: string): any | null {
    if (!DestinationMapComponent.countriesGeoData) return null;

    const nameLower = countryName.toLowerCase();
    return DestinationMapComponent.countriesGeoData.features.find((f: any) => {
      const geoName: string = (f.properties?.name || '').toLowerCase();
      return geoName === nameLower ||
             geoName.includes(nameLower) ||
             nameLower.includes(geoName);
    }) || null;
  }

  private updateWishlistHighlights(): void {
    this.wishlistHighlightsLayer.clearLayers();
    if (!DestinationMapComponent.countriesGeoData || !this.map || this.adminMode) return;

    const wishlisted = this.destinations.filter(
      d => d.wantToVisit && d.latitude != null && d.longitude != null
    );

    for (const dest of wishlisted) {
      const feature = this.findCountryFeature(dest.countryName);
      if (feature) {
        L.geoJSON(feature, {
          style: {
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            color: '#f87171',
            weight: 2,
            opacity: 0.6
          },
          interactive: false
        }).addTo(this.wishlistHighlightsLayer);
      }
    }
  }

  private highlightCountry(dest: Destination, marker: L.Marker): void {
    if (this.activeDest?.id === dest.id) return;
    this.removeHoverHighlight();

    if (this.map) {
      const feature = this.findCountryFeature(dest.countryName);
      if (feature) {
        this.hoverHighlightLayer = L.geoJSON(feature, {
          style: {
            fillColor: '#818cf8',
            fillOpacity: 0.2,
            color: '#a5b4fc',
            weight: 2,
            opacity: 0.8
          }
        }).addTo(this.map);
      }
    }

    marker.setIcon(createLabelIcon(dest.countryName, {
      highlighted: true,
      wishlisted: dest.wantToVisit
    }));
    this.activeMarker = marker;
    this.activeDest = dest;
  }

  private removeHoverHighlight(): void {
    if (this.hoverHighlightLayer && this.map) {
      this.map.removeLayer(this.hoverHighlightLayer);
      this.hoverHighlightLayer = null;
    }
    if (this.activeMarker && this.activeDest) {
      this.activeMarker.setIcon(createLabelIcon(this.activeDest.countryName, {
        wishlisted: this.activeDest.wantToVisit
      }));
      this.activeMarker = null;
      this.activeDest = null;
    }
  }

  private updateMarkers(): void {
    this.markersLayer.clearLayers();
    this.removeHoverHighlight();

    const mappable = this.destinations.filter(d => d.latitude != null && d.longitude != null);
    this.mappableCount = mappable.length;

    for (const dest of mappable) {
      const marker = L.marker([dest.latitude!, dest.longitude!], {
        icon: createLabelIcon(dest.countryName, { wishlisted: dest.wantToVisit })
      });

      marker.on('mouseover', () => this.highlightCountry(dest, marker));
      marker.on('mouseout', () => this.removeHoverHighlight());

      if ((!this.mini || this.singleMode) && !this.adminMode) {
        const popupContent = this.buildPopup(dest);
        marker.bindPopup(popupContent, { maxWidth: 280, className: 'dest-popup' });

        marker.on('popupopen', () => {
          const heartBtn = document.getElementById(`map-heart-${dest.id}`);
          heartBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.wantToVisitToggle.emit(dest);
          });
          const detailBtn = document.getElementById(`map-detail-${dest.id}`);
          detailBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewDetail.emit(dest.id);
          });
        });
      }

      marker.addTo(this.markersLayer);
    }

    this.updateWishlistHighlights();

    if (mappable.length > 0 && this.map) {
      if (this.singleMode && mappable.length === 1) {
        this.map.setView([mappable[0].latitude!, mappable[0].longitude!], 5);
      } else {
        const group = L.featureGroup(this.markersLayer.getLayers());
        this.map.fitBounds(group.getBounds().pad(0.15), { maxZoom: this.mini ? 4 : 5 });
      }
    }
  }

  private buildPopup(dest: Destination): string {
    const heartIcon = dest.wantToVisit ? 'favorite' : 'favorite_border';
    const heartClass = dest.wantToVisit ? 'popup-heart active' : 'popup-heart';
    const heartLabel = dest.wantToVisit ? 'Wishlisted' : 'Want to Visit';

    return `
      <div class="popup-content">
        <img src="${dest.flagUrl}" alt="${dest.countryName}" class="popup-flag" />
        <h4 class="popup-title">${dest.countryName}</h4>
        <div class="popup-meta">
          <span><strong>Capital:</strong> ${dest.capital}</span>
          <span><strong>Region:</strong> ${dest.region}${dest.subregion ? ' / ' + dest.subregion : ''}</span>
        </div>
        <div class="popup-actions">
          <button id="map-heart-${dest.id}" class="${heartClass}">
            <span class="material-icons" style="font-size:16px">${heartIcon}</span>
            ${heartLabel}
          </button>
          <button id="map-detail-${dest.id}" class="popup-detail-btn">
            View Details
          </button>
        </div>
      </div>
    `;
  }
}
