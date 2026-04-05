# Travel Destination Planner

A full-stack travel destination planner application built with **Angular**, **Spring Boot**, and **PostgreSQL**. Browse, search, and bookmark travel destinations sourced from the REST Countries API, visualized on an interactive world map.

## Quick Start (Docker)
### Prerequisites

- Docker & Docker Compose installed

### Run


```bash
git clone https://github.com/abmoez/travel-planner.git
cd travel-planner/
docker compose up --build
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost        |
| Backend  | http://localhost:8080   |
| Postgres | localhost:5432          |

### Default Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | user     | user123   |


## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | Angular 19, TypeScript, Leaflet |
| Backend  | Spring Boot 3.4, Java 21     |
| Database | PostgreSQL 16                 |
| Auth     | JWT (role-based: ADMIN / USER) |
| Deploy   | Docker, Docker Compose        |

## Project Structure

```
travel-planner/
├── backend/          # Spring Boot REST API
├── frontend/         # Angular SPA
├── screenshots/      # Images in the README.md
├── docker-compose.yml
└── README.md
```

## Screenshots

### Login Page

Animated login screen with quick-access demo credentials and a link to sign up.

![Login Page](screenshots/login.png)

### Sign Up Page

New user registration with role selection (User / Admin).

![Sign Up Page](screenshots/signup.png)

### User Dashboard — Map View

Interactive dark-themed world map with labeled pins for each destination. Hover over a pin to highlight the country's borders on the map. Click a pin to see the country flag, capital, region, and a "Want to Visit" button in a popup.

![Map View](screenshots/map-view.png)

### User Dashboard — Country Hover Highlight

Hovering over a destination pin highlights the country's geographic boundaries with a translucent overlay, giving a clear visual indication of which country you're interacting with.

![Country Hover Highlight](screenshots/user02.png)
![Country Click Pop-up](screenshots/user03.png)


### User Dashboard — List View

Card-based grid of destinations with flags, region tags, and quick info. Supports search and pagination.

![List View](screenshots/user_gridview.png)

### User Dashboard — Wishlist View

Card-based grid of wishlisted destinations with flags, region tags, and quick info. Supports a click to destination full page. Wishlisted Destinations get real-time highlighted in red on map.

![Wishist View](screenshots/user_map_wantToVisit.png)

### Destination Detail

Full destination detail page with a flag hero banner, stats panel (capital, population, currency, coordinates), wishlist toggle, and an embedded mini-map.

![Destination Detail](screenshots/country_details.png)

### Admin Dashboard — Country Management

Admin panel for managing destinations — search or fetch all countries from the REST Countries API with inline loading indicators, then add individually or in bulk. Remove existing destinations from the catalog.

![Admin Dashboard — Country Management](screenshots/admin_fetchAll.png)

### Admin Dashboard — Map Overview

Live map of all saved destinations with labeled pins. Hover over a pin to highlight the country's borders. The map updates automatically as destinations are added or removed.

![Admin Dashboard — Map Overview](screenshots/admin_fullDashboard.png)

## Features

### Authentication & Authorization
- JWT-based login and registration
- Role-based access control (ADMIN and USER roles)
- Protected routes with automatic token refresh
- Demo accounts for quick access

### User Features
- **Interactive World Map** — Explore destinations on a dark-themed Leaflet map with labeled country pins
- **Country Hover Highlight** — Hover over a pin to highlight the country's geographic borders on the map using locally bundled world boundary data
- **Map Popups** — Click a pin to see the country flag, capital, region, and toggle "Want to Visit"
- **List View** — Browse destinations as styled cards with flags, region tags, and population
- **View Switcher** — Toggle between Map and List views
- **Search** — Filter destinations by country name
- **Pagination** — Navigate through large destination lists
- **Want to Visit** — Bookmark destinations to a personal wishlist
- **Destination Detail** — Full-page view with flag banner, stats grid, and embedded mini-map

### Admin Features
- **Country Search** — Search the REST Countries API for countries to add, with inline loading indicators
- **Fetch All Countries** — Load the full country list with a loading spinner
- **Add / Bulk Add** — Add individual or multiple destinations at once
- **Remove Destinations** — Delete destinations from the platform
- **Map Overview** — Live interactive map showing all saved destinations with pins, labels, and hover country border highlights (no popups)
- **Manage Catalog** — View all destinations in a detailed table

### Data Seeding (Auto-populated Destinations)

On first startup, the `DataSeeder` component automatically populates the database so user-facing features can be tested immediately without any admin setup:

1. **Demo accounts** are created — `admin/admin123` (ADMIN) and `user/user123` (USER).
2. **Destinations are seeded** from `seed-destinations.json`, a bundled JSON file containing pre-fetched country data from the REST Countries API. Each entry is parsed through the same `CountryApiResponse` DTO used by the live API, mapped to a `Destination` entity (with geographic coordinates, currency, flag, etc.), and saved with `approved = true`.

This means a USER can log in and immediately browse destinations on the map, view details, and toggle "Want to Visit" — no admin intervention required.

#### Controlling Destination Seeding

Destination seeding is controlled by the `seed.destinations.pre-populate` property in `application.properties`:

```properties
# Set to true to seed destinations on startup, false to skip
seed.destinations.pre-populate=true
```

| Value   | Behavior                                                                 |
|---------|--------------------------------------------------------------------------|
| `true`  | Destinations from `seed-destinations.json` are loaded into the database on startup |
| `false` | Destination seeding is skipped; only demo user accounts are created      |

Set this to `false` if you want to start with an empty catalog and add destinations manually through the admin dashboard.

### Blocked Destinations

Blocking destinations is available by the `app.blocked-countries` property in `application.properties`:

```properties
# Add blocked destinations
app.blocked-countries=add,here,any,countries,to,be,blocked
```

### Data & API
- REST Countries API integration with field filtering (`name`, `capital`, `region`, `subregion`, `population`, `currencies`, `flags`, `latlng`)
- Geographic coordinates (latitude/longitude) for map visualization

## API Documentation

### Authentication

| Method | Endpoint             | Body                                        | Description       |
|--------|----------------------|---------------------------------------------|--------------------|
| POST   | `/api/auth/login`    | `{ "username": "", "password": "" }`        | Login, returns JWT |
| POST   | `/api/auth/register` | `{ "username": "", "password": "", "role": "USER" }` | Register |

### Admin Endpoints (requires ADMIN role)

| Method | Endpoint                        | Description                            |
|--------|---------------------------------|----------------------------------------|
| GET    | `/api/admin/countries`          | Fetch all countries from REST Countries API |
| GET    | `/api/admin/countries/search?name=` | Search countries by name            |
| POST   | `/api/admin/destinations`       | Add a country as a destination         |
| POST   | `/api/admin/destinations/bulk`  | Bulk add destinations                  |
| DELETE | `/api/admin/destinations/{id}`  | Remove a destination                   |
| GET    | `/api/admin/destinations`       | List all destinations                  |

### User Endpoints (requires USER or ADMIN role)

| Method | Endpoint                                | Description                    |
|--------|-----------------------------------------|--------------------------------|
| GET    | `/api/destinations?page=0&size=12&search=` | Paginated approved destinations |
| GET    | `/api/destinations/{id}`                | Destination details            |
| POST   | `/api/destinations/{id}/want-to-visit`  | Toggle want-to-visit           |
| GET    | `/api/destinations/want-to-visit`       | User's wishlist                |

### External API

Uses [REST Countries API](https://restcountries.com/) with field filtering:

```
GET https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,currencies,flags,latlng
GET https://restcountries.com/v3.1/name/{name}?fields=name,capital,region,subregion,population,currencies,flags,latlng
```
