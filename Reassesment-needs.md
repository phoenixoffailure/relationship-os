RelationshipOS – Final Launch Rules (Free vs Premium)

Source of truth. Implement these rules end-to-end.
Free: Must complete a daily check-in per relationship; then the first journal that day generates 1 insight (per relationship).
Premium: Must complete a daily check-in per relationship; then every journal that day generates an insight (no cap).
Partner suggestions: Premium-only, batched once/day, 1 per relationship.
Check-ins: Limit 1 per relationship per day for all users.

0) Definitions & Config
 INSIGHT_RESET_BOUNDARY = local_midnight (confirm: user’s local timezone)

 BATCH_RUN_TIME_UTC = "00:00" (or your chosen window)

 FREE_MAX_RELATIONSHIPS = 5

 CHECKIN_LIMIT_PER_RELATIONSHIP_PER_DAY = 1

 INSIGHTS_REQUIRE_CHECKIN = true // applies to both free & premium

 FREE_INSIGHT_POLICY = first_journal_only_after_checkin

 PREMIUM_INSIGHT_POLICY = every_journal_after_checkin

 PREMIUM_PARTNER_SUGGESTIONS_SCHEDULE = daily

 SUGGESTION_CARD_LIMIT = 1_per_relationship_per_batch

 FREE_PARTNER_SUGGESTIONS_ENABLED = false

1) Data Model / State
Use either control-table or derive-from-existing approach. Control-table is cleaner.

Option A (Recommended): Add control table
 Create generation_controls to track per (user, relationship):

sql
Copy
Edit
CREATE TABLE IF NOT EXISTS public.generation_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  relationship_id uuid NOT NULL REFERENCES public.relationships(id),
  last_checkin_at timestamptz,
  last_insight_generated_at timestamptz,
  last_suggestion_generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, relationship_id)
);
CREATE INDEX IF NOT EXISTS idx_genctrl_user_rel
  ON public.generation_controls(user_id, relationship_id);
CREATE INDEX IF NOT EXISTS idx_genctrl_last_checkin
  ON public.generation_controls(last_checkin_at);
ALTER TABLE public.generation_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY genctrl_owner_all ON public.generation_controls
  FOR ALL USING (auth.uid() = user_id);
Option B: Derive from existing tables
 “Has today’s check-in?” → latest row in relationship_checkins for (user, relationship) on local date.

 “Has insight today?” → latest insights row for (user, relationship) on local date.

 Ensure indexes on (user_id, relationship_id, created_at).

2) Check-In Logic (all users, all tiers)
 Enforce 1 check-in per relationship per day.

If user attempts second check-in same day → block with soft UX: “Already checked in today. You can journal now for insights.”

 Record last_checkin_at (or rely on relationship_checkins lookup).

3) Journal → Insight Logic
Rule shared by both tiers: insights only unlock after the relationship’s check-in has been completed today.

 Update journal submit handler:

 Determine tier at request time (free/premium).

 Verify today’s check-in exists for (user, relationship). If not:
- [ ] Do not generate insight; save journal; display inline prompt:
“Complete today’s check-in to unlock insights.”

 If check-in exists:
- Free path:
- [ ] If no insight yet today for (user, relationship) → generate + store; set last_insight_generated_at.
- [ ] Else → save journal; show: “Today’s insight already generated for this relationship (upgrade for more).”
- Premium path:
- [ ] Generate + store an insight for every journal that day (no cap).

 Metrics:

insights_created_free, insights_created_premium

insights_denied_no_checkin

insights_denied_daily_cap_free

4) Daily Batch – Partner Suggestions (Premium-only)
 Cron at BATCH_RUN_TIME_UTC (Supabase cron or Vercel schedule).

 Select premium relationships with any activity since last batch (journals, check-ins, deltas).

 Build daily aggregated context per relationship (journals since last batch, today’s check-in state, health deltas, prior suggestion to avoid repeats).

 Generate exactly one suggestion per relationship; store; update last_suggestion_generated_at.

 Notify recipients:

If one partner is premium → deliver to that user only.

If both premium → deliver to both (respect privacy).

 Metrics: suggestions_generated_daily, suggestions_skipped_no_activity.

5) Paywall & Feature Flags
 Enforce FREE_PARTNER_SUGGESTIONS_ENABLED = false.

 Enforce check-in required before any insight generation (both tiers).

 Free: enforce first-journal-only insight after check-in (per relationship/day).

 Premium: allow every journal after check-in to create insight.

 Free: cap relationships to FREE_MAX_RELATIONSHIPS; premium = unlimited.

6) UI/UX
Check-ins (all users):

 Show daily check-in entry point prominently per relationship.

 After check-in, journal composer shows “Insights unlocked for today.”

Free:

 On second journal (same relationship same day), show:
“Today’s insight already generated. Upgrade for unlimited insights after check-in.”

 Partner suggestions section shows locked tile + CTA:
“Daily partner suggestions are a Premium feature.”

Premium:

 If no check-in yet today, journal composer shows inline prompt to complete check-in.

 After batch time, exactly one suggestion shows per relationship with “Generated at [time].”

 Advanced analytics and compatibility fully visible.

7) Notifications
 Premium only: “Your daily partner suggestion for {relationship} is ready.”

 (Optional later) Free monthly teaser—postponed.

8) Analytics & Telemetry
 Track:

checkin_completed

journal_submitted

insights_created_{free|premium}

insights_denied_no_checkin

insights_denied_daily_cap_free

suggestions_generated_daily

paywall_click_suggestion_lock

upgrade_started_from_insight_cap

 Dashboards:

Conversion from: insight cap, suggestion lock, analytics teaser

% relationships with same-day check-in

Batch coverage (relationships with suggestion today)

9) Pricing/Copy
 Pricing page:

Free: “Check in once per relationship per day. After check-in, your first journal creates one insight per relationship.”

Premium: “Check in, then every journal creates an insight. Plus daily partner suggestions (1/relationship), advanced analytics & compatibility.”

 In-app copy must mirror the above.

10) QA – Acceptance Tests
Free User
 T1: Journal before check-in → no insight, prompt to check in.

 T2: Complete check-in (Relationship A), then first journal → insight created.

 T3: Second journal same day (A) → no insight, cap message shown.

 T4: Complete check-in & journal on Relationship B same day → insight created (cap is per relationship).

 T5: Partner suggestions remain hidden; locked tile + CTA visible.

Premium User
 T6: Journal before check-in → no insight, prompt to check in.

 T7: After check-in (Relationship A), multiple journals → insight for each.

 T8: Batch run produces exactly 1 suggestion per relationship with activity.

 T9: If only one partner premium → suggestion delivered to that user only.

Edge Cases
 E1: Timezone boundary—cap resets at local midnight (verify).

 E2: Attempt second check-in same day → blocked with friendly message.

 E3: Backdated journals do not create retroactive insights.

 E4: Batch retry won’t duplicate suggestions.

11) Rollout
 Feature-flag the new logic.

 Migrate cohort, observe 1–2 weeks.

 Backfill generation_controls if using Option A (on first access).

 Monitor AI spend (should align with new cost model: ~$0.50/free user, ~$3.06/premium user monthly).

12) Guard Rails
 Never expose raw journals in suggestions; keep anonymized inputs only.

 Enforce RLS on any new endpoints/tables.

 Log AI provider/model IDs and token usage per call.

