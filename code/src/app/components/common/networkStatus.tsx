'use client';
import useErrorState from '../../hooks/useErrorState';

type Props = {
  loading?: boolean;
};

export default function NetworkStatusBanner({ loading = false }: Props) {
  const { isOnline, slowLoading } = useErrorState(loading);

  if (isOnline && !slowLoading) return null;

  return (
    <div className="space-y-2 text-sm text-center">
      {!isOnline && (
        <p className="bg-red-600 text-white py-2 px-2">
          You are offline. Some features may not work properly.
        </p>
      )}
      {isOnline && slowLoading && (
        <p className="text-yellow-600">
          Still working on it—this may take a few more seconds.
        </p>
      )}
    </div>
  );
}
