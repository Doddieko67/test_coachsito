-- Fix RLS recursion by simplifying policies

-- First, drop problematic policies
DROP POLICY IF EXISTS "Users can view designs they collaborate on" ON designs;
DROP POLICY IF EXISTS "Editors can update collaborated designs" ON designs;
DROP POLICY IF EXISTS "Users can view messages in their designs" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their designs" ON chat_messages;
DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Design owners can manage collaborators" ON collaborators;

-- Simplified designs policies (no circular dependency)
CREATE POLICY "Users can view own designs" ON designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON designs
  FOR SELECT USING (is_template = true);

-- Simplified collaborators policies
CREATE POLICY "Users can view own collaborations" ON collaborators
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own collaborations" ON collaborators
  FOR ALL USING (user_id = auth.uid());

-- Simplified chat_messages policies
CREATE POLICY "Users can view own design messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = chat_messages.design_id 
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own designs" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = chat_messages.design_id 
      AND designs.user_id = auth.uid()
    )
  );