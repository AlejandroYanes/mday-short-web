export function formatDate(date: Date | string | number, locale = 'en-gb'): string {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return date ? dateFormatter.format(new Date(date)) : '';
}

export function formatStripeDate(date: number, locale = 'en-gb'): string {
  return formatDate(new Date(date * 1000), locale);
}
