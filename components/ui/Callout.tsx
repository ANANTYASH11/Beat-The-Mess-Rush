'use client';

import React from 'react';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface CalloutProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'saffron' | 'green' | 'red';
  title?: string;
  icon?: boolean;
  className?: string;
}

export function Callout({
  children,
  variant = 'neutral',
  title,
  icon = true,
  className = '',
}: CalloutProps) {
  const styles = {
    neutral: {
      bg: 'bg-warm-grey-100/60 border-warm-grey-200 text-ink',
      iconColor: 'text-ink-muted',
      Icon: Info,
    },
    saffron: {
      bg: 'bg-saffron/10 border-saffron/20 text-ink',
      iconColor: 'text-saffron',
      Icon: AlertTriangle,
    },
    green: {
      bg: 'bg-muted-green/10 border-muted-green/20 text-ink',
      iconColor: 'text-muted-green',
      Icon: CheckCircle,
    },
    red: {
      bg: 'bg-muted-red/10 border-muted-red/20 text-ink',
      iconColor: 'text-muted-red',
      Icon: AlertCircle,
    },
  };

  const current = styles[variant];
  const IconComponent = current.Icon;

  return (
    <div
      role="note"
      className={`flex items-start gap-3 p-4 rounded-panel border text-sm ${current.bg} ${className}`}
    >
      {icon && (
        <IconComponent
          size={18}
          strokeWidth={1.5}
          className={`flex-shrink-0 mt-0.5 ${current.iconColor}`}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-medium text-ink mb-1">{title}</h4>}
        <div className="text-ink-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
