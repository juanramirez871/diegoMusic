import React, { createContext, useContext } from 'react';
import { LibraryContextType } from './types';

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ value: LibraryContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider');
  return ctx;
};
