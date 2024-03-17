import { RenderIf } from './render-if';
import { Input, type InputProps } from './input';
import { Label } from './label';
import { cn } from './helpers';

interface Props extends InputProps {
  label: string;
  hint?: string;
  error?: string | boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

function InputWithLabel(props: Props) {
  const { label, hint, id, error, className, inputClassName, labelClassName, required, ...rest } = props;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className={labelClassName}>{label} {required ? <span>*</span> : null}</Label>
      {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
      <Input id={id} className={cn(!!error ? 'border-destructive' : null, inputClassName)} required={required} {...rest} />
      <RenderIf condition={!!error && typeof error === 'string'}>
        <span className="text-sm text-destructive-foreground">{error}</span>
      </RenderIf>
    </div>
  );
}

export { InputWithLabel };
