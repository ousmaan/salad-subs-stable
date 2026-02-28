/**
 * 404 Not Found Page
 */

import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">الصفحة غير موجودة</h2>
        <p className="text-secondary-600 mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg" fullWidth>
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
