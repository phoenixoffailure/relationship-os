{`-- RLS Policies for users table
create policy "Users can view their own profile." on users for select using (auth.uid() = id);
create policy "Users can update their own profile." on users for update using (auth.uid() = id);

-- RLS Policies for journal_entries table (private)
create policy "Users can only access their own journal entries." on journal_entries for all using (auth.uid() = user_id);

-- RLS Policies for daily_checkins table (private)
create policy "Users can only access their own daily checkins." on daily_checkins for all using (auth.uid() = user_id);

-- RLS Policies for onboarding_responses table (private)
create policy "Users can only access their own onboarding responses." on onboarding_responses for all using (auth.uid() = user_id);

-- RLS Policies for menstrual_cycles table (private)
create policy "Users can only access their own menstrual cycle data." on menstrual_cycles for all using (auth.uid() = user_id);

-- RLS Policies for cycle_insights table (user-specific shared insights)
create policy "Users can only access their own cycle insights." on cycle_insights for all using (auth.uid() = user_id);

-- RLS Policies for relationships table
create policy "Users can view relationships they are members of." on relationships for select using (
  id in (select relationship_id from relationship_members where user_id = auth.uid())
);
create policy "Users can create relationships." on relationships for insert with check (auth.uid() = created_by);
create policy "Users can update relationships they created." on relationships for update using (auth.uid() = created_by);
create policy "Users can delete relationships they created." on relationships for delete using (auth.uid() = created_by);

-- RLS Policies for relationship_members table
create policy "Users can view relationship members for relationships they are in." on relationship_members for select using (
  relationship_id in (select relationship_id from relationship_members where user_id = auth.uid())
);
create policy "Users can insert members into relationships they administer." on relationship_members for insert with check (
  relationship_id in (select relationship_id from relationship_members where user_id = auth.uid() and role = 'admin')
);
create policy "Users can delete members from relationships they administer." on relationship_members for delete using (
  relationship_id in (select relationship_id from relationship_members where user_id = auth.uid() and role = 'admin')
);

-- RLS Policies for relationship_insights table
create policy "Users can view relationship insights generated for them or for relationships they are in." on relationship_insights for select using (
  generated_for_user = auth.uid() OR relationship_id IN (SELECT relationship_id FROM relationship_members WHERE user_id = auth.uid())
);

-- RLS Policies for connection_scores table
create policy "Users can view connection scores for relationships they are members of." on connection_scores for select using (
  relationship_id in (select relationship_id from relationship_members where user_id = auth.uid())
);
`}
