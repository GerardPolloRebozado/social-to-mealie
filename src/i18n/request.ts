import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { pickLocale } from './locale';

export default getRequestConfig(async () => {
  const locale = pickLocale((await headers()).get('accept-language'));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
