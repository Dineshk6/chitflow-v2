'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import SettingsView from '@/components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        <SettingsView />
      </PageWrapper>
    </AdminLayout>
  );
}
