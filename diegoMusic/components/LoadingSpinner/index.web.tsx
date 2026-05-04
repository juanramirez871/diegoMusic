import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { LoadingSpinnerProps } from '@/interfaces/ui';

const KEYFRAME_ID = 'loading-spinner-kf';

function ensureKeyframe() {
  if (typeof document === 'undefined' || document.getElementById(KEYFRAME_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = '@keyframes _lspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export const LoadingSpinner = ({ size = 24, color = '#fff' }: LoadingSpinnerProps) => {
  useEffect(() => { ensureKeyframe(); }, []);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.1)',
            borderTopColor: color,
          },
          // @ts-ignore web-only
          { animation: '_lspin 0.8s linear infinite' },
        ]}
      />
    </View>
  );
};
