import React from 'react';
import { AmorexLogo } from './AmorexLogo';

export const DoxoLogo: React.FC<React.ComponentProps<typeof AmorexLogo>> = (props) => {
  return <AmorexLogo {...props} />;
};
