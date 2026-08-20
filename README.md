# TAPDINE Partner Portal

Official partner venue portal for the **TAPDINE** local dining discovery platform.

---

## Overview

The TAPDINE Partner Portal allows partner venues to manage digital menu uploads, administer flash promotional offers, configure geolocation mapping settings, and monitor point-of-sale transaction ledgers.

* **Sole Focus:** Designed solely and exclusively for partner venues (no employer/employee side).
* **Live Discovery:** Displays active venue locations and flash offers on interactive customer discovery maps.
* **Proximity Pings:** Automated notifications sent to nearby walking users when flash deals are active.
* **Direct Marketplace Ledger:** Clear transaction tracking with automated 10% marketplace commission deduction.

---

## Tech Stack

* **Framework:** React 19 + TypeScript + Vite
* **Database & Auth:** Supabase (`@supabase/supabase-js`)
* **Payments:** Stripe
* **Mapping:** Google Maps JavaScript API & Geocoding API
* **Edge Functions:** Supabase Functions (Deno) for proximity alerts

---

## Database Architecture (`partners` table)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `text` / `uuid` | Primary Key (Auth UID) |
| `name` | `text` | Venue trade name |
| `cuisine_type` | `text` | Primary cuisine category |
| `status` | `text` | `details_pending` \| `compliance_pending` \| `under_review` \| `approved` \| `active` |
| `commission_rate` | `numeric` | Platform rate (10.0%) |
| `id_provided` | `boolean` | Owner ID verification status |
| `hygiene_provided`| `boolean` | Food hygiene validation status |
| `hygiene_expiry` | `date` | Hygiene certificate expiry date |
| `insurance_provided`| `boolean` | Public liability policy status |
| `insurance_expiry`| `date` | Insurance policy expiry date |
| `address1` | `text` | Primary street address |
| `address2` | `text` | Secondary address / suite |
| `town` | `text` | Town / City |
| `postcode` | `text` | UK postal code |
| `tel_number` | `text` | Venue telephone contact |
| `email` | `text` | Venue account email |
| `website_url` | `text` | Linked digital menu / website |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install