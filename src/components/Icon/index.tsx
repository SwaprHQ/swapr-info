import React from 'react';

import { Wrapper } from './styled';

interface IconProps {
  icon: React.ReactElement;
  color: string;
  size: number;
}

const Icon = ({ icon, color, size = 22 }: IconProps) => (
  <Wrapper color={color}>{React.cloneElement(icon, { size })}</Wrapper>
);

export default Icon;
