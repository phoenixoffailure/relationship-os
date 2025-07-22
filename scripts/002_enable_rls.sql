{`-- Enable RLS on all tables
alter table users enable row level security;
alter table relationships enable row level security;
alter table relationship_members enable row level security;
alter table journal_entries enable row level security;
alter table daily_checkins enable row level security;
alter table onboarding_responses enable row level security;
alter table menstrual_cycles enable row level security;
alter table cycle_insights enable row level security;
alter table relationship_insights enable row level security;
alter table connection_scores enable row level security;
`}
