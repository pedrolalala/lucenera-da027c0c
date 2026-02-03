import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to regenerate signed URLs for storage files.
 * Handles both old public URLs and file paths, converting them to valid signed URLs.
 */
export function useSignedUrls(urls: string[], bucket: 'entregas-fotos' | 'materiais-separacao') {
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setSignedUrls([]);
      setIsLoading(false);
      return;
    }

    const generateSignedUrls = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newSignedUrls: string[] = [];

        for (const url of urls) {
          // Extract file path from URL
          // URLs can be:
          // 1. Full public URL: https://xxx.supabase.co/storage/v1/object/public/bucket/path
          // 2. Signed URL (already valid): https://xxx.supabase.co/storage/v1/object/sign/bucket/path?token=xxx
          // 3. Just a file path: codigo_obra/timestamp_0.jpg

          let filePath = url;

          // Check if it's already a signed URL (contains 'sign' and 'token')
          if (url.includes('/sign/') && url.includes('token=')) {
            // It's already a signed URL, but might be expired
            // Extract path and regenerate
            const match = url.match(/\/sign\/[^/]+\/(.+?)\?/);
            if (match) {
              filePath = decodeURIComponent(match[1]);
            }
          } 
          // Check if it's a public URL
          else if (url.includes('/storage/v1/object/public/')) {
            const match = url.match(/\/public\/[^/]+\/(.+)$/);
            if (match) {
              filePath = decodeURIComponent(match[1]);
            }
          }
          // Otherwise assume it's already a file path

          // Generate new signed URL
          const { data, error: signError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 604800); // 7 days

          if (signError) {
            console.error(`Error signing URL for ${filePath}:`, signError);
            // If signing fails, use original URL as fallback
            newSignedUrls.push(url);
          } else {
            newSignedUrls.push(data.signedUrl);
          }
        }

        setSignedUrls(newSignedUrls);
      } catch (err) {
        console.error('Error generating signed URLs:', err);
        setError(err instanceof Error ? err.message : 'Erro ao gerar URLs');
        // Fallback to original URLs
        setSignedUrls(urls);
      } finally {
        setIsLoading(false);
      }
    };

    generateSignedUrls();
  }, [urls, bucket]);

  return { signedUrls, isLoading, error };
}

/**
 * Generate a single signed URL for a file path
 */
export async function getSignedUrl(
  bucket: 'entregas-fotos' | 'materiais-separacao',
  filePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 604800); // 7 days

  if (error) {
    console.error(`Error signing URL for ${filePath}:`, error);
    return null;
  }

  return data.signedUrl;
}
