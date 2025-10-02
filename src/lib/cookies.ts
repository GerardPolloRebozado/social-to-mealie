import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function saveCookiesToTempFile(cookiesContent: string): Promise<string> {
  const tempDir = os.tmpdir();
  const cookiesPath = path.join(tempDir, `cookies-${Date.now()}.txt`);
  
  // Nettoyer le contenu des cookies (enlever l'en-tête GNU nano)
  const cleanContent = cookiesContent.replace(/GNU nano.*?(?=#|$)/s, '').trim();
  
  await fs.writeFile(cookiesPath, cleanContent, 'utf-8');
  return cookiesPath;
}

export async function cleanupTempCookiesFile(cookiesPath: string): Promise<void> {
  try {
    await fs.unlink(cookiesPath);
  } catch (error) {
    console.error('Error cleaning up cookies file:', error);
  }
}
