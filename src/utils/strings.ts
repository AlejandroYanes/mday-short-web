export function resolveInitials(name: string) {
  return name.split(' ').map((part) => part.at(0)?.toUpperCase()).join('').slice(0, 2);
}

export function generateQueryString(params: Record<string, string | string[] | number | boolean | null | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${v}`).join('&');
      }

      return `${key}=${value}`;
    })
    .join('&');
}
