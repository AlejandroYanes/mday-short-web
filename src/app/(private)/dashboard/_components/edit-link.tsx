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
  const [loading, setLoading] = useState(false);

  const { mutateAsync: updateLink } = api.link.update.useMutation();

  const handleClick = async (data: NewShortLink) => {
    try {
      setLoading(true);
      await updateLink({ ...data, id: link.id });
      setLoading(false);
      onSuccess();
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  };

  return (
    <LinkFormModal
      title="Update a link"
      initialValue={link}
      loading={loading}
      onSubmit={handleClick}
      trigger={
        <Button variant="ghost" size="sm">
          <IconEdit size={16} />
        </Button>
      }
    />
  );
}
