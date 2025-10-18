// app/admin/create/page.jsx (server component)
import React, { Suspense } from 'react';
import CreateClient from './CreateClient';

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading editor…</div>}>
      <CreateClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
