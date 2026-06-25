import React from 'react';
import SyncLoader from 'react-spinners/SyncLoader';

interface LoadingSpinnerProps {
  message?: string;
  color?: string;
  size?: number;
}

export const LoadingSpinner = ({ message, color = '#555', size = 5 }: LoadingSpinnerProps) => (
  <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
    {message && <p style={{ color: '#555', fontSize: '11pt' }}>{message}</p>}
    <SyncLoader size={size} color={color} aria-label="Loading Spinner" data-testid="loader" />
  </div>
);
