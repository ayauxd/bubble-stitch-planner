'use client';

import React from 'react';
import { GridProvider, useGridState } from '../context/GridContext';
import DesignMode from './DesignMode';
import WorkMode from './WorkMode';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';

function AppContent() {
  const state = useGridState();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {state.mode === 'design' ? <DesignMode /> : <WorkMode />}
    </div>
  );
}

export default function App() {
  return (
    <GridProvider>
      <ServiceWorkerRegistration />
      <AppContent />
    </GridProvider>
  );
}
