import { ReactNode, HTMLAttributes } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-white/90 backdrop-blur p-5 shadow-sm ${className}`}>{children}</div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 flex items-center justify-between ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '', ...rest }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-base font-semibold ${className}`} {...rest}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
