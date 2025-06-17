import { supabase } from '../lib/supabase';

export const uploadService = {
  /**
   * Sube una imagen a Supabase Storage
   * @param file - Archivo de imagen a subir
   * @param folder - Carpeta dentro del bucket (opcional)
   * @returns URL pública de la imagen subida
   */
  async uploadImage(file: File, folder: string = 'designs'): Promise<string> {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('La imagen es demasiado grande (máximo 10MB)');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading file:', filePath);

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('design-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('design-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Elimina una imagen de Supabase Storage
   * @param url - URL de la imagen a eliminar
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('design-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Image deleted successfully:', filePath);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Optimiza una imagen antes de subirla (redimensiona si es muy grande)
   * @param file - Archivo original
   * @param maxWidth - Ancho máximo (default: 1920)
   * @param maxHeight - Alto máximo (default: 1080)
   * @param quality - Calidad JPEG (default: 0.8)
   * @returns Archivo optimizado
   */
  async optimizeImage(
    file: File, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File(
                [blob],
                file.name,
                { 
                  type: file.type,
                  lastModified: Date.now()
                }
              );
              resolve(optimizedFile);
            } else {
              reject(new Error('Error optimizing image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error loading image'));
      img.src = URL.createObjectURL(file);
    });
  }
};