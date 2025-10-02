'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { progressType, recipeResult } from '@/lib/types';
import { CircleCheck, CircleX, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { env } from '@/lib/constants';

export default function RecipeFetcher() {
  const [urlInput, setUrlInput] = useState('');
  const [progress, setProgress] = useState<progressType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipe] = useState<recipeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [totalUrls, setTotalUrls] = useState(0);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [alert, setAlert] = useState<{type: 'info' | 'warning' | 'error', message: string} | null>(null);

  async function fetchRecipe() {
    setLoading(true);
    setProgress(null);
    setError(null);
    setAlert(null);
    
    // Vérifier si l'URL a déjà été traitée
    try {
      const historyCheck = await fetch('/api/history');
      const { history: existingUrls } = await historyCheck.json();
      const urlExists = existingUrls.some((entry: any) => entry.url === urlInput);
      
      if (urlExists) {
        setAlert({
          type: 'warning',
          message: 'Cette URL a déjà été traitée. Vous pouvez la retrouver dans l\'historique.'
        });
        setLoading(false);
        return;
      }

      // Ne pas définir l'URL ici
    } catch (error) {
      console.error('Failed to check URL history:', error);
    }

    const urlList: string[] = urlInput.split(',').map((u) => u.trim()).filter(u => u);
    setTotalUrls(urlList.length);
    setCurrentUrlIndex(0);

    try {
      for (const [index, url] of urlList.entries()) {
        setCurrentUrlIndex(index + 1);
        setCurrentUrl(url);
        const response = await fetch('/api/get-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch recipe');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No readable stream available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (let line of lines) {
            line = line.trim();
            if (!line || !line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.progress) {
                setProgress(data.progress);
              }
              if (data.createdRecipe) {
                setRecipe((prev) => [...(prev || []), data.createdRecipe]);
                setLoading(false);
                setTimeout(() => {
                  setProgress(null);
                }, 10000);
              } else if (data.error) {
                setError(data.error);
                setLoading(false);
              }
            } catch (e) {
              setError('Error parsing event stream');
              setLoading(false);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setCurrentUrl(null);
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <h1 className='text-3xl font-bold mb-6'>Welcome to social to Mealie Plus</h1>
      
      {/* Section d'entrée d'URL */}
      <div className="w-full max-w-2xl space-y-4">
        <Textarea
          placeholder={'Insert all the urls to import separated by ,'}
          className='w-full'
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        
        <Button className='w-full' onClick={fetchRecipe} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </div>

      {/* Section d'alerte */}
      {alert && (
        <Card className={`mt-4 w-full max-w-2xl border-l-4 ${
          alert.type === 'warning' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950' :
          alert.type === 'error' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
          'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className={`h-5 w-5 ${
                alert.type === 'warning' ? 'text-amber-500' :
                alert.type === 'error' ? 'text-red-500' :
                'text-blue-500'
              }`} />
              <p className={`text-sm ${
                alert.type === 'warning' ? 'text-amber-800 dark:text-amber-200' :
                alert.type === 'error' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                {alert.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section de progression */}
      {(progress || loading) && (
        <Card className={'mt-4 w-full max-w-2xl'}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Progression</span>
              <span className="text-sm font-mono">
                {currentUrlIndex}/{totalUrls}
              </span>
            </CardTitle>
            {currentUrl && (
              <CardDescription className="mt-2 truncate">
                URL en cours : {currentUrl}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentUrlIndex / totalUrls) * 100}%` }}
              />
            </div>
            {progress && (
              <div className="flex flex-col gap-4 justify-center items-center mt-4">
                <p className={'flex gap-4 items-center'}>
                  Téléchargement{' '}
                  {progress.videoDownloaded === true ? (
                    <CircleCheck className="text-green-500" />
                  ) : progress.videoDownloaded === null ? (
                    <Spinner size={'small'} />
                  ) : (
                    <CircleX className="text-red-500" />
                  )}
                </p>
                <p className={'flex gap-4 items-center'}>
                  Transcription{' '}
                  {progress.audioTranscribed === true ? (
                    <CircleCheck className="text-green-500" />
                  ) : progress.audioTranscribed === null ? (
                    <Spinner size={'small'} />
                  ) : (
                    <CircleX className="text-red-500" />
                  )}
                </p>
                <p className={'flex gap-4 items-center'}>
                  Création recette{' '}
                  {progress.recipeCreated === true ? (
                    <CircleCheck className="text-green-500" />
                  ) : progress.recipeCreated === null ? (
                    <Spinner size={'small'} />
                  ) : (
                    <CircleX className="text-red-500" />
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section des recettes */}
      {recipes && (
        <div className='flex flex-wrap justify-center gap-4 max-w-7xl mt-8'>
          {recipes.map((recipe) => (
            <a href={recipe.url} key={recipe.url} target='_blank' rel='noreferrer'>
              <Card className='w-60'>
                <CardHeader>
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {recipe.imageUrl ? (
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.description} 
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400" style={{display: recipe.imageUrl ? 'none' : 'flex'}}>
                      <span className="text-4xl">🍽️</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
