import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Une erreur est survenue',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="w-fit">
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function FullPageError({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ErrorMessage title={title} message={message} onRetry={onRetry} />
      </div>
    </div>
  );
}
