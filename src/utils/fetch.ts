import { retry } from 'radash';

interface Params {
  url: string;
  method?: string;
  body?: Record<any, any>;
  headers?: Record<any, any>;
  options?: RequestInit;
}

export const callAPI = async <T = any>(params: Params) => {
  const { url, method = 'GET', body, headers = {}, options = {} } = params;
  return new Promise<T>(async (resolve, reject) => {
    try {
      const response = await fetch(
        url,
        {
          method,
          body: body ? JSON.stringify(body) : undefined,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          ...options,
        });

      if (response.ok) {
        resolve(response.json());
      } else {
        reject({ status: response.status, response: (await response.json()) });
      }
    } catch (e: any) {
      reject(e);
    }
  });
}
