# Smart Planner architecture

## Existing application audit

The app is a React + Vite project using the existing Supabase client and AuthContext. The planner page runs `PlannerWizard` → `SmartPlanner` → `tripRecommendationService` → `PlannerResult`. Saved trips use the existing `trips`, `trip_destinations`, and `budget_items` services. Leaflet was already installed and is reused by the destination map. Authentication and protected routing remain on the existing implementation.

Destination queries are centralized in `src/services/destinationService.js`; the old Supabase destination module now re-exports that service. The former production fixture fallback has been removed from destination reads. Published Supabase rows and category relations are the only planner source. Planner candidate queries are bounded and use a coordinate bounding box followed by exact Haversine filtering; the general public catalog is paginated separately. The legacy fixture files remain available to unrelated legacy flows and are not imported by the destination source service.

## Geographic context and scoring

The selected destination supplies its city, province, and coordinates when present. The planner does not invent city centroids. With coordinates, candidates must be within a duration-derived maximum radius (capped at 150 km by default, and at 250 km at the data service boundary). If selected-area coordinates are missing, the planner stays within the exact selected city/regency. Records without coordinates are included only when their city matches exactly; their route contribution is limited and labeled.

Haversine distance is a straight-line geographic estimate. The UI and route metadata explicitly say it is not road distance or drive time. V1 currently calls the existing deterministic nearest-neighbor utility. The existing `RouteProvider`/`GeographicRouteProvider` abstraction remains available for a future asynchronous road-routing adapter.

`scoreDestination` returns separate location, preference, budget, and itinerary-fit components plus human-readable reasons. Recommendations must pass geographic eligibility before ranking. Preference aliases cover English and Indonesian category names; keywords can supplement category relations, but do not establish popularity. Clusters are derived from coordinates, not a hardcoded city-to-destination list.

## Itinerary

Selected destinations are grouped into geographic clusters and routed deterministically. The V1 planner caps the day at two destinations, uses opening-hour ranges when it can parse them, inserts flexible meal/rest time, and uses category-based generic visit-duration estimates when verified duration metadata is absent. The itinerary labels these durations as estimates. Customization can remove or add a candidate from the same local result set and assign destinations to days; route distance and budget are recalculated.

## Budget

The budget uses traveler count, day and night count, room/vehicle estimates by travel style, and published ticket prices multiplied by travelers. Known attraction prices are summed from selected records, so paid/free attractions affect that line dynamically. Unknown ticket prices are excluded from the arithmetic and called out; they are never presented as free. Main transport, accommodation, food, local transport, and other expenses use visible generic style benchmarks because the wizard does not collect origin or booking quotes. The planner reports an over-budget deficit and exposes lower-cost alternatives; it never hides a negative remaining budget.

## Save flow and limitations

Generation is local review state. The user must choose “Gunakan Rencana Ini” to save. Saving uses the existing authenticated user ID, creates one trip, and sends itinerary and budget rows in batch inserts. It assigns each destination the itinerary day date. On a detail-write failure, cleanup of the new trip and its child rows is attempted and reported. Supabase/PostgREST does not provide a transaction across these independent requests, so cleanup is best effort.

Prices for accommodation, food, and transport are estimates, not live quotes. No road-routing provider, verified visit-duration field, popularity data, or persistent provenance columns exist in the confirmed schema. Destination results and counts depend on the connected Supabase data; run `npm run data:report -- --database` to inspect current coverage.
