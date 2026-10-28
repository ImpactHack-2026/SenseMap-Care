# SenseMap-Care

## Healthcare search backend

Install with `bun install`. Run `bun test`, `bun run typecheck`, and `bun run build` to verify. `bun run dev` starts the Next.js API server.

### Server configuration

Set environment variables in **Settings → Environment**; never expose API keys to browser code.

| Variable | Meaning |
| --- | --- |
| `SERPAPI_KEY` | Optional server-side SerpAPI key. In the default auto mode, its presence selects live search; without it, search uses fictional demo data. |
| `DATA_MODE` | `auto` (default), `demo`, or `live`. Explicit demo forces fictional demo results. Without a key, even explicit live uses demo. |
| `SUPABASE_URL` | Optional server-side Supabase project URL; required for saved facilities. |
| `SUPABASE_ANON_KEY` | Optional server-side Supabase publishable or legacy anon key; required for saved facilities. Never use a service-role or secret key. |

No key is required during development or builds. A configured live provider failure returns an error rather than switching to demo. Demo records and response metadata are labeled `demo`; live records are labeled `live`.

### API

- `GET /api/care/search?query=fremont&facilityType=clinic&page=1&pageSize=20` searches facilities. `query` is required; facility type and pagination are optional. Supported types: `hospital`, `clinic`, `urgent_care`, `primary_care`, and `specialist`. Page numbers start at 1 and page size is at most 100. Live search examines at most six SerpAPI Maps pages (120 raw results); filtering can reduce the number returned. Live totals are not asserted. Queries are biased toward Fremont, CA but provider results are not guaranteed to be geographically confined.
- `GET /api/care/{facilityId}` returns normalized details or 404. Demo IDs continue to resolve as labeled demo records when live mode is enabled. Live IDs are Google Maps `place_id` values obtained from live search.

Responses use the Phase 1 success/error envelope. The search result contains `dataMode`, `items`, `pagination`, and `hasMore`; demo search also supplies `total`. Unexpected errors do not disclose provider details or credentials. Results are returned uncached by this app.

### Saved facilities

The checked-in workspace did not contain an existing Supabase client or auth integration. To enable saving, configure the two Supabase variables above, configure Supabase Auth for non-anonymous users, and apply `supabase/migrations/20261028000000_saved_care_facilities.sql` using your normal Supabase migration workflow (for example, `supabase db push` for a linked project). This migration creates an owner-scoped table and RLS policies; it has not been applied automatically.

The frontend must obtain a non-anonymous Supabase user access token through Supabase Auth and send it as `Authorization: Bearer <access-token>`. The publishable key alone and anonymous device IDs do not authenticate users. `GET /api/care/saved` lists up to 500 saved IDs with timestamps; `PUT /api/care/saved/{facilityId}` saves an existing facility and `DELETE /api/care/saved/{facilityId}` removes it. Save and delete are idempotent. Missing/invalid authentication returns 401; unavailable storage returns 503. Public search, profiles, and guides do not depend on Supabase. Preferences remain request-scoped; only owner ID, facility ID, and creation timestamp are saved.

Before production, verify RLS and authentication with two real accounts against the target Supabase project; mocked tests do not prove database policy behavior. Confirm provider terms permit storage of facility identifiers. The API currently has no application-level rate limiting and saved-list pagination beyond its 500-row limit; configure appropriate rate limiting and monitoring before production.

### Sensory evidence

`GET /api/care/{facilityId}/evidence` returns an `available` or `insufficient_evidence` result, its data mode, and attributed evidence items. Known fictional demo facilities have invented illustrative examples explicitly labeled `illustrative_demo`, with no fabricated source URL; they are not reviews. A live facility ID never receives demo evidence. Normalization discards malformed, unattributed, duplicate, and unrelated excerpts and identifies noise, lighting, crowding, seating, or smells using simple keyword rules; category matches are not sensory scores or verified claims.

With `SERPAPI_KEY` configured, live evidence is collected from SerpAPI's Google Maps Reviews engine (`place_id` lookup, newest-first, at most three pages / 30 reviews). Records without a source link are dropped; every retained item keeps the original snippet exactly as returned, source URL, source name, author, date and review ID when present. Excerpts are filtered to the facility's own reviews, deduplicated, and classified only when clearly relevant. Errors, quota limits and malformed responses surface as `UPSTREAM_ERROR`; an empty or fully unattributed result returns `insufficient_evidence`. Review text is processed in memory for the request only: it is never persisted or logged, and no evidence is sent to AI. Displaying excerpts requires provider attribution (author, source and a direct link to the individual review) — confirm this complies with your SerpAPI plan and any applicable provider restrictions before production use.

### Sensory profiles

`GET /api/care/{facilityId}/profile` returns facility details and a sensory analysis with factor scores, confidence, original evidence, data mode, and an overall score. Scores are deterministic keyword-based summaries, not medically validated measurements or guarantees of sensory safety. Demo profiles are illustrative only.

Each unambiguous favorable mention contributes 100 and each unfavorable mention contributes 0; the factor score is their rounded mean. Ambiguous or negated observations are not scored. A factor with no directional evidence is null. Confidence is limited for demo or a single source; two independent live sources yield low confidence, three consistent sources medium, and five consistent sources high. Conflicting reports cap confidence at low. These rules are heuristics, not statistical certainty.

The overall score requires three scored factors and renormalizes the weights of available factors: noise 30%, lighting 25%, crowding 20%, seating 15%, smells 10%. Otherwise it is null with `insufficient_evidence`. Current demo examples contain fewer than three scored factors per facility, so overall demo scores are currently null. No review-derived profiles are stored.

### Personalized preparation guide

`POST /api/care/{facilityId}/guide` accepts a JSON object such as `{"preferences":["quieter_surroundings","clear_waiting_instructions"],"includePersonalNote":true}`. Both fields are optional; supported preference values are `quieter_surroundings`, `less_intense_lighting`, `less_crowded_waiting`, `seating_requirements`, and `clear_waiting_instructions`. Unsupported fields or preference values are rejected; no diagnosis or free-text personal information is requested. The optional personal note is generated from the selected preferences and can be copied.

The response separates facility details and attributed sensory evidence from unknowns, questions, and practical checklist suggestions. Preferences prioritize relevant evidence without changing scores. Questions ask about possible accommodations rather than asserting they exist. Demo labels are preserved, and no preferences or guide are persisted; responses are not cached. Guides are not treatment advice or guarantees of sensory safety.

The requested `docs/DATA_POLICY.md` is not present in this repository, so its specific requirements could not be verified. Before production use, review the policy when available, SerpAPI's [legal terms](https://serpapi.com/legal), and any applicable upstream provider restrictions. Search results can be inaccurate and must not be treated as medical advice. SerpAPI uses [Google Maps search and place lookup](https://serpapi.com/google-maps-api).
