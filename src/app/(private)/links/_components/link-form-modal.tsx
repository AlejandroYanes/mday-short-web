'use client'

import { type ReactNode, useRef, useState } from 'react';

import {
  Button,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  InputWithLabel,
  Label,
  Loader,
  RenderIf,
} from 'ui';
import type { NewShortLink, ShortLink } from 'models/links';

interface  Props {
  title: string;
  description?: string;
  error?: string | null;
  initialValue?: ShortLink;
  loading: boolean;
  trigger: ReactNode;
  onSubmit: (link: NewShortLink) => Promise<void>;
  onClose?: () => void;
}

export default function LinkFormModal(props: Props) {
  const { title, description, error, initialValue, trigger, loading, onSubmit, onClose } = props;

  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date | undefined>(initialValue?.expiresAt ? new Date(initialValue.expiresAt) : undefined);

  const formRef = useRef<HTMLFormElement>(null);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowModal(false);
      if (onClose) {
        onClose();
      }
    } else {
      setShowModal(true);
    }
  };

  const handleClick = async () => {
    const form = new FormData(formRef.current!);
    const data = {
      url: form.get('url') as string,
      slug: form.get('shortName') as string,
      password: form.get('password') as string,
      expiresAt: date?.toUTCString() ?? null,
      domain: null,
    };

    try {
      await onSubmit(data);
      setShowModal(false);
    }  catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <RenderIf condition={!!description}>
            <DialogDescription>
              {description}
            </DialogDescription>
          </RenderIf>
        </DialogHeader>
        <form ref={formRef}>
          <RenderIf condition={!!error}>
            <div className="text-red-500 dark:text-red-400 text-base mb-4">{error}</div>
          </RenderIf>
          <div className="flex flex-col gap-6 pt-6 pb-10">
            <InputWithLabel label="URL" name="url" required defaultValue={initialValue?.url} />
            <InputWithLabel
              required
              name="shortName"
              label="Short name"
              hint={'Use words linked by "-" and do not use any other special character (eg: /, %, $, etc). Preferable use 2-5 words.'}
              defaultValue={initialValue?.slug}
            />
            <InputWithLabel
              label="Password"
              name="password"
              hint="In case you want to restrict who can access the link"
              defaultValue={initialValue?.password || undefined}
            />
            <div className="flex flex-col gap-2">
              <Label>Expiration Date</Label>
              <span className="text-sm text-muted-foreground">
                Set an expiration date for the link, after this date the link will be disabled.
              </span>
              <DatePicker date={date} onChange={setDate}/>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="black" disabled={loading} onClick={handleClick}>
            <RenderIf condition={loading}>
              <Loader color="white" size="xs" className="mr-2"/>
            </RenderIf>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
