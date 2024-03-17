'use client'

import { useState } from 'react';
import { format } from 'date-fns';
import { IconCalendar } from '@tabler/icons-react';

import { cn } from './helpers';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface Props {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker(props: Props) {
  const { date, onChange, className } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal border-input dark:border-slate-500',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
