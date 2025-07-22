{`-- Create users table
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create relationships table
create table relationships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  relationship_type text not null check (relationship_type in ('couple', 'family', 'friends', 'work', 'poly', 'custom')),
  created_by uuid references users(id) not null,
  created_at timestamp with time zone default now()
);

-- Create relationship_members table (many-to-many)
create table relationship_members (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references relationships(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone default now(),
  unique (relationship_id, user_id)
);

-- Create journal_entries table (private)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  content text not null,
  mood_score integer check (mood_score between 1 and 10),
  ai_analysis jsonb, -- Private AI insights for user only
  created_at timestamp with time zone default now()
);

-- Create daily_checkins table (private)
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  relationship_id uuid references relationships(id) on delete cascade,
  connection_score integer check (connection_score between 1 and 10),
  mood_score integer check (mood_score between 1 and 10),
  gratitude_note text,
  challenge_note text,
  created_at timestamp with time zone default now()
);

-- Create onboarding_responses table (private)
create table onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  responses jsonb not null, -- Private detailed responses
  completed_at timestamp with time zone default now()
);

-- Create menstrual_cycles table (private)
create table menstrual_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cycle_start_date date not null,
  cycle_length integer default 28 check (cycle_length between 21 and 45),
  period_length integer default 5 check (period_length between 1 and 10),
  symptoms jsonb, -- Track symptoms, mood changes, etc.
  notes text,
  is_active boolean default true, -- Current cycle vs historical
  created_at timestamp with time zone default now()
);

-- Create cycle_insights table (shared insights)
create table cycle_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cycle_id uuid references menstrual_cycles(id) on delete cascade,
  phase text not null check (phase in ('menstrual', 'follicular', 'ovulation', 'luteal')),
  predicted_mood jsonb, -- AI predictions for this phase
  partner_suggestions jsonb, -- What partners should know (anonymized)
  generated_at timestamp with time zone default now()
);

-- Create relationship_insights table (shared insights)
create table relationship_insights (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references relationships(id) on delete cascade,
  generated_for_user uuid references users(id), -- Who this insight is FOR
  insight_type text not null check (insight_type in ('suggestion', 'milestone', 'pattern', 'appreciation')),
  title text not null,
  description text not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Create connection_scores table (shared insights)
create table connection_scores (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references relationships(id) on delete cascade,
  score integer check (score between 0 and 100),
  factors jsonb, -- Breakdown of score components
  calculated_at timestamp with time zone default now()
);
`}
