import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type DesignInsert = Database['public']['Tables']['designs']['Insert'];
type DesignUpdate = Database['public']['Tables']['designs']['Update'];

export const designsService = {
  async getMyDesigns() {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDesignById(id: string) {
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createDesign(design: DesignInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('designs')
      .insert({
        ...design,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDesign(id: string, updates: DesignUpdate) {
    const { data, error } = await supabase
      .from('designs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDesign(id: string) {
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateDesign(id: string) {
    // Get original design
    const original = await this.getDesignById(id);
    if (!original) throw new Error('Design not found');

    // Create copy (user_id will be set by the service)
    return this.createDesign({
      title: `${original.title} (Copy)`,
      canvas_data: original.canvas_data,
      thumbnail_url: original.thumbnail_url,
      user_id: '' // This will be overridden by the service
    });
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createDesignFromTemplate(templateId: string, title: string) {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Create design from template (user_id will be set by the service)
    return this.createDesign({
      title,
      canvas_data: template.canvas_data,
      thumbnail_url: template.thumbnail_url,
      user_id: '' // This will be overridden by the service
    });
  },

  // Real-time subscription for design updates
  subscribeToDesign(designId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`design:${designId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'designs',
          filter: `id=eq.${designId}`
        },
        callback
      )
      .subscribe();
  },

  // Upload design thumbnail
  async uploadThumbnail(designId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${designId}.${fileExt}`;
    const filePath = `design-thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(filePath);

    // Update design with thumbnail URL
    await this.updateDesign(designId, { thumbnail_url: publicUrl });

    return publicUrl;
  }
};