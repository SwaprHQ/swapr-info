import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../../Theme';
import { ActiveEndedWrapper, LockedWrapper } from './styled';

const StatusBadge = ({ isActive, isLocked }) => (
  <Flex sx={{ gap: '8px' }}>
    {isLocked && (
      <LockedWrapper>
        <Typography.Custom
          color={'orange1'}
          sx={{ fontWeight: 700, fontSize: '10px', lineHeight: '10px', letterSpacing: '0.04em' }}
        >
          LOCKED
        </Typography.Custom>
      </LockedWrapper>
    )}
    <ActiveEndedWrapper isActive={isActive}>
      <Typography.Custom
        color={isActive ? 'green1' : 'red1'}
        sx={{ fontWeight: 700, fontSize: '10px', lineHeight: '10px', letterSpacing: '0.04em' }}
      >
        {isActive ? 'ACTIVE' : 'ENDED'}
      </Typography.Custom>
    </ActiveEndedWrapper>
  </Flex>
);

StatusBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool,
};

export default StatusBadge;
