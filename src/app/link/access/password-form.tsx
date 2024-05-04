'use client'

import { useState } from 'react';

import { Button, Input } from 'ui';
import { validatePassword } from './action';

interface Props {
  slug: string;
  wslug?: string;
  domain?: string;
}

export default function PasswordForm(props: Props) {
  const { slug, wslug, domain } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('sending form data to the server');
    setIsLoading(true);
    const form = event.currentTarget?.form;

    if (!form) {
      return;
    }

    const data = {
      domain: (form.elements as any).domain.value,
      wslug: (form.elements as any).wslug.value,
      slug: (form.elements as any).slug.value,
      password: (form.elements as any).password.value,
    };

    try {
      const response = await validatePassword(data);

      if (response.access === 'denied') {
        setError(true);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <form>
      <div className="mt-4 flex flex-col items-center w-[360px]">
        <h2 className="text-3xl text-center mb-1">Almost there</h2>
        <p className="text-base">
          Please enter the password to access this link.
        </p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <input name="domain" type="hidden" value={domain}/>
          <input name="wslug" type="hidden" value={wslug}/>
          <input name="slug" type="hidden" value={slug}/>

          <Input name="password" type="password" placeholder="Password" className="w-full" disabled={isLoading}/>
          <Button type="submit" className="w-full" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? 'Checking...' : 'Continue'}
          </Button>

          {error ? <span>This is not the correct password, please try again</span> : null}
        </div>
      </div>
    </form>
  );
}
