-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'designer', 'viewer')) DEFAULT 'designer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create designs table
CREATE TABLE designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{"elements": []}',
  thumbnail_url TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collaborators table
CREATE TABLE collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, user_id)
);

-- Create templates table
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{"elements": []}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_chat_messages_design_id ON chat_messages(design_id);
CREATE INDEX idx_collaborators_design_id ON collaborators(design_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for designs
CREATE POLICY "Users can view own designs" ON designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view designs they collaborate on" ON designs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.design_id = designs.id 
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create designs" ON designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs" ON designs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Editors can update collaborated designs" ON designs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.design_id = designs.id 
      AND collaborators.user_id = auth.uid()
      AND collaborators.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can delete own designs" ON designs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their designs" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = chat_messages.design_id 
      AND designs.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.design_id = chat_messages.design_id 
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their designs" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = chat_messages.design_id 
      AND designs.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.design_id = chat_messages.design_id 
      AND collaborators.user_id = auth.uid()
    )
  );

-- RLS Policies for collaborators
CREATE POLICY "Users can view collaborators" ON collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = collaborators.design_id 
      AND designs.user_id = auth.uid()
    ) OR collaborators.user_id = auth.uid()
  );

CREATE POLICY "Design owners can manage collaborators" ON collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = collaborators.design_id 
      AND designs.user_id = auth.uid()
    )
  );

-- RLS Policies for templates
CREATE POLICY "Templates are viewable by everyone" ON templates
  FOR SELECT USING (true);

-- Functions and Triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to automatically add owner as collaborator
CREATE OR REPLACE FUNCTION add_owner_as_collaborator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collaborators (design_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_design_created
  AFTER INSERT ON designs
  FOR EACH ROW EXECUTE FUNCTION add_owner_as_collaborator();

-- Insert sample templates
INSERT INTO templates (name, category, canvas_data, thumbnail_url) VALUES
('Plantilla de Presentación', 'business', '{"elements": [{"type": "text", "content": "Título de Presentación", "position": {"x": 100, "y": 50}, "style": {"fontSize": 32, "fontWeight": "bold"}}]}', null),
('Tarjeta de Visita', 'business', '{"elements": [{"type": "text", "content": "Nombre", "position": {"x": 50, "y": 30}}, {"type": "text", "content": "Cargo", "position": {"x": 50, "y": 60}}]}', null),
('Post de Instagram', 'social', '{"elements": [{"type": "shape", "shape": "square", "position": {"x": 0, "y": 0}, "size": {"width": 500, "height": 500}, "style": {"backgroundColor": "#f0f0f0"}}]}', null),
('Banner Web', 'marketing', '{"elements": [{"type": "text", "content": "¡Oferta Especial!", "position": {"x": 200, "y": 100}, "style": {"fontSize": 48, "color": "#ff0000"}}]}', null),
('Infografía', 'education', '{"elements": [{"type": "text", "content": "Datos Importantes", "position": {"x": 150, "y": 30}, "style": {"fontSize": 24, "fontWeight": "bold"}}]}', null);