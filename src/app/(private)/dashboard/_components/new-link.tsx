'use client'

import { useState } from 'react';
import type { TRPCError } from '@trpc/server';

import { Button } from 'ui';
import { api } from 'trpc/react';
import type { NewShortLink } from 'models/links';
import LinkFormModal from './link-form-modal';

interface  Props {
  onSuccess: () => void;
}

export default function NewLink(props: Props) {
  const { onSuccess } = props;
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createLink, isLoading } = api.link.create.useMutation();

  const handleClick = async (data: NewShortLink) => {
    try {
      await createLink(data);
      onSuccess();
    } catch (e: any) {
      if (e.shape.data.code === 'BAD_REQUEST') {
        setError(e.shape.message);
      }
      throw e;
    }
  };

  return (
    <LinkFormModal
      title="Add new link"
      description="Create a new link to share, customize the new link with a shorter name. You can set a password, and expiration date."
      loading={isLoading}
      error={error}
      onSubmit={handleClick}
      trigger={<Button variant="black">Add new link</Button>}
    />
  );
}
