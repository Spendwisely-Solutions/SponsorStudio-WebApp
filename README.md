# SponsorStudio Database Schema & Structure

SponsorStudio uses **Supabase** (PostgreSQL) for user authentication, database management, and media storage. The database schema contains tables designed to manage user profiles, opportunities, matches, pricing, client showcases, and success blogs.

---

## Database Tables Overview

Below is the list of tables defined in the schema:

1. [**`profiles`**](#1-profiles): Stores detailed accounts for users, brands, creators, and event organizers.
2. [**`categories`**](#2-categories): Lists event/placement classification categories.
3. [**`opportunities`**](#3-opportunities): Contains available sponsorship opportunities listed by organizers or creators.
4. [**`matches`**](#4-matches): Manages connections, requests, and meeting link bindings between brands and opportunities.
5. [**`client_logos`**](#5-client_logos): Stores external client/sponsor logo URLs showcased on the landing page.
6. [**`success_stories`**](#6-success_stories): Houses success stories, case studies, and blog posts.

---

### 1. `profiles`
Stores user profile information. Users are categorized by `user_type` which controls their system permissions and dashboard layouts.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, references auth.users | Unique identifier corresponding to authentication record |
| `user_type` | `text` | `'brand' \| 'agency' \| 'creator' \| 'event_organizer' \| 'admin'` | The system role/domain of the user account |
| `company_name` | `text` | Nullable | Legal business name or organization name |
| `website` | `text` | Nullable | Link to the user's official website |
| `industry` | `text` | Nullable | Primary business sector (e.g., Tech, Beverage) |
| `industry_details`| `text` | Nullable | Supplementary industry category details |
| `company_size` | `text` | Nullable | Range of employees (e.g., "10-50", "100-500") |
| `annual_marketing_budget`| `numeric` | Nullable | Yearly ad spend limits (for Brands / Agencies) |
| `marketing_channels`| `text[]` | Nullable | Array of target channels (e.g., `['digital', 'offline']`) |
| `previous_sponsorships`| `jsonb` | Nullable | Historical details of past sponsor campaigns |
| `sponsorship_goals`| `text[]` | Nullable | Targets (e.g., `['brand_awareness', 'sales_conversion']`) |
| `target_audience` | `jsonb` | Nullable | Target demographics configuration |
| `location` | `text` | Nullable | City, state or geographical headquarters |
| `contact_person_name`| `text` | Nullable | Primary contact representative name |
| `contact_person_position`| `text` | Nullable | Job title of the representative |
| `contact_person_phone`| `text` | Nullable | Contact phone number |
| `social_media` | `jsonb` | Nullable | Map of social links (e.g. `{"instagram": "...", "linkedin": "..."}`) |
| `profile_picture_url`| `text` | Nullable | URL to user's uploaded avatar/profile photo |
| `created_at` | `timestamp` | default: `now()` | Date and time the account profile was initialized |
| `updated_at` | `timestamp` | default: `now()` | Date and time of the last update |

#### JSON Example
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "user_type": "event_organizer",
  "company_name": "Zenith Tech Events",
  "website": "https://zenithevents.com",
  "industry": "Entertainment & Events",
  "industry_details": "Tech summits and hackathons",
  "company_size": "50-100",
  "annual_marketing_budget": null,
  "marketing_channels": null,
  "previous_sponsorships": [
    { "partner": "RedBull", "year": 2024, "type": "Beverage Sponsor" }
  ],
  "sponsorship_goals": null,
  "target_audience": {
    "age_range": "18-35",
    "interests": ["coding", "entrepreneurship", "gaming"]
  },
  "location": "Bengaluru, Karnataka",
  "contact_person_name": "Rahul Sharma",
  "contact_person_position": "Director of Events",
  "contact_person_phone": "+919876543210",
  "social_media": {
    "instagram": "https://instagram.com/zenithevents",
    "linkedin": "https://linkedin.com/company/zenithevents"
  },
  "profile_picture_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-06-09T13:42:00Z"
}
```

---

### 2. `categories`
Used to categorize event styles and advertising placement models.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default: `gen_random_uuid()` | Unique identifier for the category |
| `name` | `text` | Not Null | Display name (e.g., "College Festival") |
| `description` | `text` | Nullable | Explanatory description of what this category entails |
| `created_at` | `timestamp` | default: `now()` | Date the category was added |

#### JSON Example
```json
{
  "id": "e8a93cb3-c155-408d-8ad1-6f4e198116c4",
  "name": "Hackathon & Tech Summit",
  "description": "Developer events, design jams, AI hackathons, and corporate technical symposia.",
  "created_at": "2026-01-10T08:00:00Z"
}
```

---

### 3. `opportunities`
Sponsorship listings published by creators and event organizers looking for brand funding.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default: `gen_random_uuid()` | Unique listing ID |
| `creator_id` | `uuid` | Foreign Key -> `profiles.id` | Reference to listing publisher |
| `category_id` | `uuid` | Foreign Key -> `categories.id` | Reference to category ID |
| `title` | `text` | Not Null | Title of the event or placement |
| `description` | `text` | Not Null | Detailed writeup of the opportunity |
| `location` | `text` | Not Null | Location or venue (e.g., "Mumbai" or "Online") |
| `reach` | `integer` | Nullable | Estimated general impressions/audience size |
| `footfall` | `integer` | Nullable | Estimated physically present attendees |
| `start_date` | `timestamp` | Nullable | Start date of the event/ad placement |
| `end_date` | `timestamp` | Nullable | End date of the event/ad placement |
| `price_range` | `jsonb` | Nullable | Price boundaries, e.g. `{"min": 10000, "max": 50000}` |
| `requirements` | `text` | Nullable | Guidelines or conditions for prospective brands |
| `benefits` | `text` | Nullable | Deliverables provided to the brand |
| `media_urls` | `text[]` | Nullable | URLs of photos/videos/brochures of the event |
| `status` | `text` | `'active' \| 'paused' \| 'completed'` | Current listing public state |
| `calendly_link` | `text` | Nullable | Scheduling link to set up direct video calls |
| `sponsorship_brochure_url`| `text` | Nullable | Storage URL to download the PDF brochure |
| `is_verified` | `boolean` | default: `false` | Admin verification badge flag |
| `verification_status`| `text` | `'pending' \| 'approved' \| 'rejected'` | Current moderation state |
| `rejection_reason` | `text` | Nullable | Reason for disapproval if verification fails |
| `ad_type` | `text` | Nullable | Banner style, stall dimensions, or placement model |
| `ad_duration` | `text` | Nullable | Physical duration or layout retention term |
| `ad_dimensions` | `text` | Nullable | Size dimensions for physical advertising |
| `foot_traffic` | `integer` | Nullable | Verified attendee rate |
| `peak_hours` | `jsonb` | Nullable | Times of peak exposure metrics |
| `target_demographics` | `jsonb` | Nullable | Audience detail mapping (age, gender ratio, etc.) |
| `created_at` | `timestamp` | default: `now()` | Opportunity creation timestamp |
| `updated_at` | `timestamp` | default: `now()` | Opportunity edit timestamp |

#### JSON Example
```json
{
  "id": "7320b982-f047-49d7-8cfb-6f81c96a7cfb",
  "creator_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "category_id": "e8a93cb3-c155-408d-8ad1-6f4e198116c4",
  "title": "Hack India 2026",
  "description": "India's largest hackathon with 1000+ top engineering participants working over 36 hours on AI innovations.",
  "location": "KTPO Trade Centre, Bengaluru",
  "reach": 250000,
  "footfall": 1200,
  "start_date": "2026-10-12T09:00:00Z",
  "end_date": "2026-10-14T18:00:00Z",
  "price_range": { "min": 25000, "max": 150000 },
  "requirements": "Sponsors must supply high-res vector logos. Premium sponsors get stall space.",
  "benefits": "Logo on developer certificates, premium stall booth, slide presentation mention, social media blast.",
  "media_urls": [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
  ],
  "status": "active",
  "calendly_link": "https://calendly.com/sponsorstudio/hack-india-meet",
  "sponsorship_brochure_url": "https://supabase-storage.url/opportunities/hack_india_brochure.pdf",
  "is_verified": true,
  "verification_status": "approved",
  "rejection_reason": null,
  "ad_type": "Title Sponsor / Stall Sponsor",
  "ad_duration": "3 Days",
  "ad_dimensions": "3m x 3m Premium Stall Space",
  "foot_traffic": 1200,
  "peak_hours": {
    "hackathon_opening": "Saturday 10:00 AM",
    "project_pitching": "Sunday 02:00 PM"
  },
  "target_demographics": {
    "age": "18-24",
    "audience_type": "Developers, Tech Students, Engineers",
    "gender_ratio": "70% Male / 30% Female"
  },
  "created_at": "2026-05-15T06:30:00Z",
  "updated_at": "2026-06-09T10:00:00Z"
}
```

---

### 4. `matches`
Facilitates and tracks direct applications, pairings, and integrations between brands and opportunities.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default: `gen_random_uuid()` | Match ID |
| `opportunity_id` | `uuid` | Foreign Key -> `opportunities.id` | Linked sponsorship opportunity |
| `brand_id` | `uuid` | Foreign Key -> `profiles.id` | Linked interested Brand / Sponsor |
| `status` | `text` | `'pending' \| 'accepted' \| 'rejected' \| 'completed'` | Application phase status |
| `meeting_scheduled_at`| `timestamp` | Nullable | Scheduled meeting date/time |
| `meeting_link` | `text` | Nullable | Online meeting room URL (e.g. Google Meet) |
| `notes` | `text` | Nullable | Custom message, offer proposal details, or context |
| `created_at` | `timestamp` | default: `now()` | Pairing initialized timestamp |
| `updated_at` | `timestamp` | default: `now()` | Match state change timestamp |

#### JSON Example
```json
{
  "id": "18ac260e-8fb8-41e9-9133-e7f0e309f984",
  "opportunity_id": "7320b982-f047-49d7-8cfb-6f81c96a7cfb",
  "brand_id": "8e9b11ca-9c8d-4eef-b12a-36d7a48bb22d",
  "status": "accepted",
  "meeting_scheduled_at": "2026-06-15T11:00:00Z",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "notes": "We are interested in the Title Sponsor package and would like to coordinate custom logo mockups for the main stage banner.",
  "created_at": "2026-06-08T14:30:00Z",
  "updated_at": "2026-06-09T08:15:00Z"
}
```

---

### 5. `client_logos`
Stores details of trusted brands showcased in the "Trusted By" logo ticker section on the home page landing screen.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default: `gen_random_uuid()` | Client record ID |
| `name` | `text` | Not Null | Name of the brand (e.g. "Coca Cola") |
| `logo_url` | `text` | Not Null | Hosted asset URL for rendering the brand logo image |
| `created_at` | `timestamp` | default: `now()` | Ticker addition timestamp |

#### JSON Example
```json
{
  "id": "22ffb762-ee2b-426b-88a2-d485f7a01d51",
  "name": "PepsiCo India",
  "logo_url": "https://i.ibb.co/example/pepsico_logo.png",
  "created_at": "2026-03-01T04:12:00Z"
}
```

---

### 6. `success_stories`
Houses the blogs, case studies, and sponsor highlights displayed on the landing page and `/stories` path.

#### Structure
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default: `gen_random_uuid()` | Post unique ID |
| `title` | `text` | Not Null | Article headline title |
| `preview_image` | `text` | Not Null | URL of the cover image preview card |
| `preview_text` | `text` | Not Null | Brief preview paragraph/excerpt |
| `content` | `text` | Not Null | Full article content (supports rich markdown formatting) |
| `media` | `jsonb` | Array of media objects | Media items inside the article (structure described below) |
| `created_at` | `timestamp` | default: `now()` | Publication timestamp |
| `updated_at` | `timestamp` | default: `now()` | Latest edit timestamp |

##### `media` Array Object Structure
```json
{
  "type": "image" | "video",
  "url": "https://...",
  "caption": "Optional label description"
}
```

#### JSON Example
```json
{
  "id": "e2ba9b84-fce8-48b6-9de1-2a6234fc2e81",
  "title": "How Intel Powered DevForge 2025: A Success Story",
  "preview_image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  "preview_text": "Discover how Intel's sponsorship of DevForge 2025 drove recruitment, engagement, and brand reach among top student developers.",
  "content": "# DevForge 2025 Collaboration\n\nIntel collaborated with DevForge to provide state-of-the-art workstations for AI model training. The partnership resulted in:\n\n* **800+** active developers engaged\n* **45** AI models built on Intel OpenVINO\n* **10L+** social media reach\n\n### The Impact\nBy bringing hardware resources directly to developers, Intel built solid brand affinity with the engineering community...",
  "media": [
    {
      "type": "image",
      "url": "https://images.unsplash.com/photo-1531482615713-2afd69097998",
      "caption": "Developers pitching their solutions at the Intel Booth"
    }
  ],
  "created_at": "2026-04-10T12:00:00Z",
  "updated_at": "2026-06-01T09:30:00Z"
}
```
