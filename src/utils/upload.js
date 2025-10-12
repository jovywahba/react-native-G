// src/utils/upload.js
import * as FileSystem from 'expo-file-system/legacy';
import { toByteArray } from 'base64-js';
import { supabase, SUPABASE_BUCKET } from '../supabase';

// يحوّل uri -> Uint8Array ويرفعه لسوبا-بيس
export async function uploadImageFromUri(uri, path, contentType = 'image/jpeg') {
  // اقرأ الملف Base64 بالـ legacy API
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // حوّله لبـايتس
  const bytes = toByteArray(base64);

  // ارفع البايتس
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, filePath: path };
}
