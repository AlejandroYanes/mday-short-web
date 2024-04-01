'use client'

import { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';

import { Button } from 'ui';
import { api } from 'trpc/react';
import type { NewShortLink, ShortLink } from 'models/links';
import LinkFormModal from './link-form-modal';

interface  Props {
  link: ShortLink;
  onSuccess: () => void;
}

export default function EditLink(props: Props) {
  const { link, onSuccess } = props;
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateLink, isLoading } = api.link.update.useMutation();

  const handleClick = async (data: NewShortLink) => {
    try {
      await updateLink({ ...data, id: link.id });
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
      title="Update a link"
      initialValue={link}
      loading={isLoading}
      error={error}
      onSubmit={handleClick}
      trigger={
        <Button variant="ghost" size="sm">
          <IconEdit size={16} />
        </Button>
      }
    />
  );
}
