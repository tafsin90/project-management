'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { loadWorkspaces } from '../features/workspaceSlice';

function WorkspaceLoader() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(loadWorkspaces()); }, [dispatch]);
  return null;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <WorkspaceLoader />
      <Toaster />
      {children}
    </Provider>
  );
}
