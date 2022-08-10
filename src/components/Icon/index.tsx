import React from 'react';

import { IconWrapper } from './styled';

interface IconProps {
  icon: React.ReactNode;
  marginRight?: string;
  color: string;
}

const Icon = ({ icon, color, marginRight }: IconProps) => (
  <IconWrapper marginRight={marginRight} color={color}>
    {icon}
  </IconWrapper>
);

export default Icon;
