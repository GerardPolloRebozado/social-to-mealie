'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { progressType, recipeResult } from '@/lib/types';
import { CircleCheck, CircleX } from 'lucide-react';
import { useState } from 'react';

export function RecipeFetcher({ tags }: { tags: string[] }) {
  const [urlInput, setUrlInput] = useState('');
  const [progress, setProgress] = useState<progressType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipe] = useState<recipeResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchRecipe() {
    setLoading(true);
    setProgress(null);
    setError(null);
    const urlList: string[] = urlInput.split(',').map((u) => u.trim());

    try {
      for (const url of urlList) {
        const response = await fetch('/api/get-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/event-stream',
          },
          body: JSON.stringify({ url, tags }),
        });
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No readable stream available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          chunk.split('\n\n').forEach((event) => {
            if (!event.startsWith('data: ')) return;

            try {
              const data = JSON.parse(event.replace('data: ', ''));
              if (data.progress) {
                setProgress(data.progress);
              }
              if (data.name) {
                setRecipe((recipes) => [...(recipes || []), data]);
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
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Textarea
        placeholder={'Insert all the urls to import separated by ,'}
        className='w-96 m-4'
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />
      <Button className='w-96' onClick={fetchRecipe} disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </Button>

      {progress && (
        <Card className={'mt-4 w-96'}>
          <CardHeader>
            <CardTitle>{error || 'Progress'}</CardTitle>
          </CardHeader>
          <CardContent className={'flex flex-col gap-4 justify-center items-center'}>
            <p className={'flex gap-4'}>
              Video downloaded{' '}
              {progress.videoDownloaded === true ? (
                <CircleCheck />
              ) : progress.videoDownloaded === null ? (
                <Spinner size={'small'} />
              ) : (
                <CircleX />
              )}
            </p>
            <p className={'flex gap-4'}>
              Audio transcribed{' '}
              {progress.audioTranscribed === true ? (
                <CircleCheck />
              ) : progress.audioTranscribed === null ? (
                <Spinner size={'small'} />
              ) : (
                <CircleX />
              )}
            </p>
            <p className={'flex gap-4'}>
              Recipe created{' '}
              {progress.recipeCreated === true ? (
                <CircleCheck />
              ) : progress.recipeCreated === null ? (
                <Spinner size={'small'} />
              ) : (
                <CircleX />
              )}
            </p>
          </CardContent>
        </Card>
      )}
      {recipes && (
        <div className='flex flex-wrap justify-center gap-4 max-w-7xl'>
          {recipes.map((recipe) => (
            <a href={recipe.url} key={recipe.url} target='_blank' rel='noreferrer'>
              <Card className='mt-4 w-60'>
                <CardHeader>
                  <img src={recipe.imageUrl} alt={recipe.description} className='aspect-square object-cover' />
                  <CardTitle>{recipe.name}</CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
