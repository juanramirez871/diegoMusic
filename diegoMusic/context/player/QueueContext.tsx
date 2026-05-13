import React, { createContext, useContext } from 'react';
import { QueueContextType } from './types';

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ value: QueueContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within a QueueProvider');
  return ctx;
};
