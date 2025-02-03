'use client';

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
      <p className="text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
} 