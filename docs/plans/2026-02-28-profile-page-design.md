# Profile Page & Beta Invite System

## Overview

Add a `/profile` page with account info, theme toggle, sign out, and a beta invite code system that gates new signups.

## Profile Page Sections

### Account Info
- Display user name (editable), email (read-only), initials avatar
- Name updates go to Supabase `user_metadata`

### Theme Toggle
- Light / Dark / System selector
- Wire up `next-themes` ThemeProvider at root layout
- Dark mode CSS variables already exist in `globals.css`

### Beta Invite Code
- Each user gets a unique 8-character alphanumeric code
- 5 invite slots per user
- Shows: code with copy button, usage count ("3 of 5 used"), list of who redeemed (name/email + date)

### Sign Out
- Sign out button at bottom of page

## Database

### `invite_codes` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid FK -> auth.users | ON DELETE CASCADE |
| code | text UNIQUE | 8-char alphanumeric, generated on user creation |
| max_uses | int | default 5 |
| times_used | int | default 0 |
| created_at | timestamptz | default now() |

### `invite_redemptions` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| invite_code_id | uuid FK -> invite_codes | ON DELETE CASCADE |
| redeemed_by | uuid FK -> auth.users | ON DELETE CASCADE |
| created_at | timestamptz | default now() |

### RLS Policies
- Users can read their own invite code and redemptions
- Insert on invite_redemptions is public (needed during signup before auth session exists)

### Postgres function: `redeem_invite_code(code text, user_id uuid)`
- Validates code exists
- Checks times_used < max_uses
- Inserts into invite_redemptions
- Increments times_used atomically
- Returns success/error

### Auto-generate invite code on signup
- Database trigger on auth.users insert creates an invite_codes row with a random 8-char code

## Signup Flow Changes
- Add "Invite Code" required field to signup form
- Validate code before calling signUp()
- After signup confirmation, call redeem_invite_code() via the auth callback
- Store invite_code in user_metadata during signup for retrieval in callback

## Bootstrap
- Seed migration with a founder invite code (unlimited uses) for initial users

## Approach
- Database trigger for atomic invite validation (race-condition safe)
- Server Components for profile page data fetching
- Client component for theme toggle and name editing
