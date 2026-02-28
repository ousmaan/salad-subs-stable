/**
 * Admin Staff Management Page
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useFormValidation } from '@/hooks/useFormValidation';

interface StaffMember {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export default function StaffPage() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  useFormValidation(formRef);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff');
      const data = await response.json();

      if (response.ok && data.success) {
        setStaff(data.staff);
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAdding(true);

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStaffName, pin: newStaffPin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(t('success.created'));
        setNewStaffName('');
        setNewStaffPin('');
        setShowAddForm(false);
        fetchStaff();
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm(t('common.confirm', { defaultValue: 'Are you sure?' }))) return;

    try {
      const response = await fetch(`/api/admin/staff?staffId=${staffId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(t('success.deleted'));
        fetchStaff();
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-secondary-900">{t('admin.staffManagement')}</h1>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? t('common.cancel') : t('admin.addStaff')}
        </Button>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Add Staff Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.addStaff')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleAddStaff} className="space-y-4">
              <Input
                label={t('customer.name')}
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                required
              />
              <Input
                label={t('auth.pin')}
                type="password"
                value={newStaffPin}
                onChange={(e) => setNewStaffPin(e.target.value)}
                placeholder={t('auth.pinPlaceholder')}
                required
                maxLength={6}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={adding}>
                {t('admin.addStaff')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.staffList')} ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-center text-secondary-600 py-8">{t('table.noData')}</p>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-lg">{member.name}</p>
                    <p className="text-sm text-secondary-600">
                      {t('date.created', { defaultValue: 'Created' })}:{' '}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.isActive ? 'success' : 'neutral'}>
                      {member.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}
                    </Badge>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
