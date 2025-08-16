'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ title, message, onRetry, className }: ErrorMessageProps) {
  return (
    <div className={cn('text-center p-8', className)}>
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
