import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Card className={cn('bg-card border-border shadow-sm', className)}>
      <CardContent className="p-10 flex flex-col items-center text-center gap-3">
        {icon && <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
        {action && (
          <Button onClick={action.onClick} className="mt-2 bg-primary text-primary-foreground">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmptyState;
