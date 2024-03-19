import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';

import type { ShortLink } from 'models/links';
import { api } from 'trpc/react';
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'ui';

interface  Props {
  link: ShortLink;
  onSuccess: () => void;
}

export default function DeleteLink(props: Props) {
  const { link, onSuccess } = props;
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: deleteLink } = api.link.delete.useMutation();

  const handleDelete = async () => {
    try {
      await deleteLink({ id: link.id });
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <IconTrash size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the link? This action cannot be undone.
            {error ? (
              <>
                <br/>
                <br/>
                <span className="text-red-500 dark:text-red-400">{error}</span>
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
