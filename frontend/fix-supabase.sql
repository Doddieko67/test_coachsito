-- ============================================
-- FIX PARA RECURSIÓN INFINITA EN SUPABASE RLS
-- ============================================

-- 1. DESHABILITAR RLS TEMPORALMENTE para testing
ALTER TABLE designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS PROBLEMÁTICAS (si existen)
DROP POLICY IF EXISTS "Users can view their own designs" ON designs;
DROP POLICY IF EXISTS "Users can create their own designs" ON designs;
DROP POLICY IF EXISTS "Users can update their own designs" ON designs;
DROP POLICY IF EXISTS "Users can delete their own designs" ON designs;
DROP POLICY IF EXISTS "Users can view collaborator designs" ON designs;

DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can manage collaborators" ON collaborators;

-- 3. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Política simple para designs
CREATE POLICY "designs_policy" ON designs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. HABILITAR RLS SOLO PARA DESIGNS (por ahora)
-- Las demás tablas quedan sin RLS temporalmente para evitar recursión

-- 5. VERIFICACIÓN
-- Ejecuta esto para verificar que no hay políticas problemáticas:
-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('designs', 'profiles', 'collaborators');

-- ============================================
-- INSTRUCCIONES:
-- 1. Copia este contenido
-- 2. Ve a Supabase Dashboard → SQL Editor
-- 3. Pega y ejecuta este script
-- 4. Prueba la aplicación
-- ============================================