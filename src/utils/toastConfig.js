import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22c55e', backgroundColor: '#2D3261' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}
      text2Style={{ color: '#FFF' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#2D3261' }}
      text1Style={{ color: '#FFF', fontSize: 16 }}
      text2Style={{ color: '#FFF' }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#3b82f6', backgroundColor: '#2D3261' }}
      text1Style={{ color: '#FFF', fontSize: 16 }}
      text2Style={{ color: '#FFF' }}
    />
  ),
};
