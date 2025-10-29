import * as React from 'react';
import { cn } from '../../lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { label: string; value: string }[];
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        className
      )}
      {...props}
    >
      {children}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
          {option.label}
        </option>
      ))}
    </select>
  )
);
Select.displayName = 'Select';

export { Select };
