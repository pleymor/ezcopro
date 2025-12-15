import { Spinner } from './spinner';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Chargement...' }: LoadingProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function FullPageLoading({ message = 'Chargement...' }: LoadingProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
