import React from 'react';

import { IconWrapper } from './styled';

interface IconProps {
  icon: React.ReactNode;
  color: string;
}

const Icon = ({ icon, color }: IconProps) => <IconWrapper color={color}>{icon}</IconWrapper>;

export default Icon;
