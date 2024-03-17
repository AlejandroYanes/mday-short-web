'use client'

import { useState } from 'react';

import { Button } from 'ui';
import { api } from 'trpc/react';
import type { NewShortLink } from 'models/links';
import LinkFormModal from './link-form-modal';

interface  Props {
  onSuccess: () => void;
}

export default function NewLink(props: Props) {
  const { onSuccess } = props;
  const [loading, setLoading] = useState(false);

  const { mutateAsync: createLink } = api.link.create.useMutation();

  const handleClick = async (data: NewShortLink) => {
    try {
      setLoading(true);
      await createLink(data);
      setLoading(false);
      onSuccess();
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  };

  return (
    <LinkFormModal
      title="Add new link"
      description="Create a new link to share, customize the new link with a shorter name. You can set a password, and expiration date."
      loading={loading}
      onSubmit={handleClick}
      trigger={<Button variant="black">Add new link</Button>}
    />
  );
}
