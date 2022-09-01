import PropTypes from 'prop-types';

import { Typography } from '../../../Theme';
import { Wrapper } from './styled';

const StatusBadge = ({ isActive }) => (
  <Wrapper isActive={isActive}>
    <Typography.Custom
      color={isActive ? 'green1' : 'red1'}
      sx={{ fontWeight: 700, fontSize: '10px', lineHeight: '10px', letterSpacing: '0.04em' }}
    >
      {isActive ? 'ACTIVE' : 'ENDED'}
    </Typography.Custom>
  </Wrapper>
);

StatusBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default StatusBadge;
