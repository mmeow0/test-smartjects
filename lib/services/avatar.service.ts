import { getSupabaseBrowserClient } from "../supabase";
import { userService } from "./user.service";

export const avatarService = {
  // Upload avatar and update user profile
  async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Validate file
      const validation = this.validateAvatarFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.${fileExtension}`;

      // Get current user to check if they have an existing avatar
      const currentUser = await userService.getUserById(userId);

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { success: false, error: 'Failed to upload avatar' };
      }

      // Get public URL for the uploaded avatar
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user's avatar_url in database
      const updateSuccess = await userService.updateUser(userId, {
        avatar: publicUrl
      });

      if (!updateSuccess) {
        // If database update fails, clean up the uploaded file
        await this.deleteAvatarFile(fileName);
        return { success: false, error: 'Failed to update user profile' };
      }

      // Clean up old avatar file if it exists
      if (currentUser?.avatar) {
        await this.deleteOldAvatar(currentUser.avatar);
      }

      return { success: true, avatarUrl: publicUrl };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  },

  // Delete avatar and update user profile
  async deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get current user to check if they have an avatar
      const currentUser = await userService.getUserById(userId);

      if (!currentUser?.avatar) {
        return { success: true }; // No avatar to delete
      }

      // Update user's avatar_url to null in database
      const updateSuccess = await userService.updateUser(userId, {
        avatar: undefined
      });

      if (!updateSuccess) {
        return { success: false, error: 'Failed to update user profile' };
      }

      // Delete the avatar file
      await this.deleteOldAvatar(currentUser.avatar);

      return { success: true };
    } catch (error) {
      console.error('Error in deleteAvatar:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  },

  // Validate avatar file
  validateAvatarFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be a JPEG, PNG, WebP' };
    }

    return { valid: true };
  },

  // Helper function to delete avatar file from storage
  async deleteAvatarFile(filePath: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting avatar file:', error);
      }
    } catch (error) {
      console.error('Error in deleteAvatarFile:', error);
    }
  },

  // Helper function to delete old avatar based on URL
  async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'avatars');

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        // Get the path after 'avatars/'
        const filePath = urlParts.slice(bucketIndex + 1).join('/');
        await this.deleteAvatarFile(filePath);
      }
    } catch (error) {
      console.error('Error extracting file path from avatar URL:', error);
    }
  }
};
