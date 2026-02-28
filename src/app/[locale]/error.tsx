/**
 * Global Error Boundary
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-4">خطأ</h1>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-secondary-600 mb-6">نعتذر عن المشكلة. الرجاء المحاولة مرة أخرى.</p>
        <div className="space-y-3">
          <Button variant="primary" size="lg" fullWidth onClick={() => reset()}>
            حاول مرة أخرى
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => (window.location.href = '/')}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
