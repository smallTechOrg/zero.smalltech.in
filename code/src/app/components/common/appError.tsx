'use client';

type Props = {
  errors?: (string | null | undefined)[];
};

export default function AppErrorBanner({ errors = [] }: Props) {
  const visibleErrors = Array.from(new Set(errors.filter(Boolean)));

  if (visibleErrors.length === 0) return null;

  return (
    <div className="space-y-2 text-sm text-center">
      {visibleErrors.map((err, idx) => (
        <p key={idx} className="text-red-600">{err}</p>
      ))}
    </div>
  );
}
