import { RecipeFetcher } from '@/components/recipe-fetcher';
import GetTagSelect from '../components/tag-select/tag-fetch';
import {Suspense} from "react";
import {Spinner} from "@/components/ui/spinner";
import { getTranslations } from 'next-intl/server';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const tagQuery = sp.tagQuery as string | undefined;
  const tags = (sp.tags as string)?.split(',').filter(Boolean) ?? [];
  const t = await getTranslations('Home');

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold'>{t('welcome')}</h1>
        <Suspense fallback={<Spinner />}>
      <RecipeFetcher tags={tags} />
        </Suspense>
      <div className='w-fit min-w-96 m-4'>
        <GetTagSelect query={tagQuery} />
      </div>
    </div>
  );
}
