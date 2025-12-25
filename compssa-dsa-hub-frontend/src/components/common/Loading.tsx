import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inline?: boolean;
};

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function Loading({ label = 'Loading...', size = 'md', className, inline = false }: LoadingProps) {
  const iconSize = sizeMap[size];
  const container = inline ? 'inline-flex items-center gap-2' : 'flex items-center justify-center gap-2 py-8';

  return (
    <div className={cn(container, className)} aria-live="polite" aria-busy="true">
      <Loader2 className={cn(iconSize, 'animate-spin text-muted-foreground')} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

export default Loading;
