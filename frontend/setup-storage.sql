-- ============================================
-- CONFIGURACIÓN SUPABASE STORAGE PARA IMÁGENES
-- ============================================

-- 1. Crear bucket para imágenes de diseños
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true);

-- 2. Crear políticas de almacenamiento
-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'design-images');

-- Permitir que cualquiera vea las imágenes (público)
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'design-images');

-- Permitir que usuarios autenticados actualicen sus imágenes
CREATE POLICY "Users can update their images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'design-images');

-- Permitir que usuarios autenticados eliminen sus imágenes
CREATE POLICY "Users can delete their images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'design-images');

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega y ejecuta este script
-- 3. Ve a Storage → Buckets para verificar que se creó 'design-images'
-- ============================================