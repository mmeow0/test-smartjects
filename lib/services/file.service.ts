import { getSupabaseBrowserClient } from "../supabase";

export const fileService = {
  async deleteFile(fileId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Получаем информацию о файле
      const { data: fileData, error: fetchError } = await supabase
        .from("proposal_files")
        .select("path")
        .eq("id", fileId)
        .single();

      if (fetchError) {
        console.error("Error fetching file data:", fetchError);
        return false;
      }

      // Удаляем файл из хранилища
      if (fileData?.path) {
        const { error: storageError } = await supabase.storage
          .from("proposal-files")
          .remove([fileData.path as string]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          return false;
        }
      }

      // Удаляем запись о файле из базы данных
      const { error: deleteError } = await supabase
        .from("proposal_files")
        .delete()
        .eq("id", fileId);

      if (deleteError) {
        console.error("Error deleting file record:", deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return false;
    }
  },

  async downloadFile(path: string, filename: string): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .storage
        .from("proposal-uploads")
        .createSignedUrl(path, 60); // ссылка активна 60 секунд

      if (error || !data?.signedUrl) {
        console.error("Ошибка при получении signed URL:", error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
      return null;
    }
  }
};