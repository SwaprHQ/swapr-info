import React from 'react';
import { Box } from 'rebass';

const Grid = ({ gridTemplateColumns, gridGap, justifySelf, ...props }) => (
  <Box {...props} sx={{ display: 'grid', gridTemplateColumns, gridGap, justifySelf }}></Box>
);

export { Grid };
