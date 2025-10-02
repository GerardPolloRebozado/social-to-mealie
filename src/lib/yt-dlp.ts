import fs from 'node:fs/promises';
import path from 'node:path';
import type { socialMediaResult } from '@/lib/types';
import YTDlpWrap from 'yt-dlp-wrap';

const ytDlpPath = path.join('/app', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const outputDir = path.join('/app', 'temp');

export async function ensureYtDlpBinary() {
  const ytDlpVersion = process.env.YT_DLP_VERSION || '2023.11.16';
  let exists = false;

  console.log(`Platform: ${process.platform}, yt-dlp path: ${ytDlpPath}`);

  try {
    await fs.access(ytDlpPath);
    exists = true;
    console.log('yt-dlp binary exists');
  } catch {
    exists = false;
    console.log('yt-dlp binary does not exist');
  }

  if (!exists) {
    console.log(`Downloading yt-dlp binary version ${ytDlpVersion}...`);
    try {
      await YTDlpWrap.downloadFromGithub(ytDlpPath, ytDlpVersion);
      
      if (process.platform !== 'win32') {
        try {
          await fs.chmod(ytDlpPath, 0o755);
          console.log('Set executable permissions on yt-dlp binary');
        } catch (e) {
          console.warn('Could not set executable permissions on yt-dlp binary:', e);
        }
      }
      console.log('yt-dlp binary downloaded successfully.');
    } catch (error) {
      console.error('Error downloading yt-dlp:', error);
      throw new Error('Failed to download yt-dlp binary. Please try again or install it manually.');
    }
  }
}

export async function downloadWithYtDlp(url: string, cookiesPath?: string) {
  console.log('Starting downloadWithYtDlp for URL:', url);
  await ensureYtDlpBinary();
  
  console.log('Creating YTDlpWrap with path:', ytDlpPath);
  const ytDlpWrap = new YTDlpWrap(ytDlpPath);
  const outputFile = path.join(outputDir, 'audio.wav');
  await fs.mkdir(outputDir, { recursive: true });

  const args = [url, '-x', '--audio-format', 'wav', '-o', outputFile];
  
  // Use cookies if provided
  if (cookiesPath && cookiesPath.trim()) {
    console.log('Using cookies file:', cookiesPath);
    try {
      await fs.access(cookiesPath);
      console.log('Cookies file exists and is accessible');
      
      // Lire le contenu du fichier pour debug
      const cookieContent = await fs.readFile(cookiesPath, 'utf-8');
      const lines = cookieContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log(`Cookies file contains ${lines.length} cookie entries`);
      
      args.push('--cookies', cookiesPath);
    } catch (error) {
      console.error('Cookies file not accessible:', error);
      console.warn(`Warning: Cookies file not found or not accessible: ${cookiesPath}, continuing without cookies`);
    }
  } else {
    console.log('No cookies path provided');
  }

  console.log('yt-dlp args:', args);

  try {
    // Download audio
    console.log('Starting yt-dlp execution...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('yt-dlp execution timeout after 60 seconds')), 60000);
    });
    
    const execPromise = ytDlpWrap.execPromise(args);
    const result = await Promise.race([execPromise, timeoutPromise]);
    
    console.log('yt-dlp execution completed successfully');
    console.log('yt-dlp result:', result);
    
    // Get metadata using execPromise with --dump-json and cookies
    let metadata;
    try {
      const metadataArgs = [url, '--dump-json'];
      if (cookiesPath && cookiesPath.trim()) {
        metadataArgs.push('--cookies', cookiesPath);
      }
      
      console.log('Getting metadata with args:', metadataArgs);
      const metadataOutput = await ytDlpWrap.execPromise(metadataArgs);
      
      // execPromise returns stdout, parse it as JSON
      if (typeof metadataOutput === 'string') {
        metadata = JSON.parse(metadataOutput);
      } else {
        throw new Error('Invalid metadata output format');
      }
    } catch (error) {
      console.warn('Failed to get metadata with execPromise, using basic fallback');
      // Create basic metadata fallback
      metadata = {
        title: 'Social Media Video',
        description: 'Video from social media',
        thumbnail: null
      };
    }
    
    const buffer = await fs.readFile(outputFile);
    console.log('Audio file read successfully, size:', buffer.length, 'bytes');
    return { buffer, metadata };
  } catch (error) {
    console.error('Error in yt-dlp execution:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  } finally {
    await fs.unlink(outputFile).catch(() => {});
  }
}

export async function downloadMediaWithYtDlp(url: string, cookiesPath?: string): Promise<socialMediaResult> {
  const { buffer, metadata } = await downloadWithYtDlp(url, cookiesPath);
  return {
    blob: new Blob([buffer], { type: 'audio/mp3' }),
    thumbnail: metadata.thumbnail,
    description: metadata.description || 'No description found',
  };
}
