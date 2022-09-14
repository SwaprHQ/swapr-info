import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { ReactComponent as FarmDisabledSvg } from '../../assets/svg/farm-disabled.svg';
import { ReactComponent as FarmSvg } from '../../assets/svg/farm.svg';
import Icon from '../Icon';
import { Wrapper } from './styled';

const FarmBadge = ({ isActive }) => (
  <Wrapper isActive={isActive}>
    <div>
      <Icon
        marginRight={'0'}
        icon={isActive ? <FarmSvg height={13} width={22} /> : <FarmDisabledSvg height={13} width={22} />}
      />
    </div>
    <Typography.Custom
      color={isActive ? 'green1' : 'mercuryGray'}
      sx={{ fontWeight: 700, fontSize: '9px', lineHeight: '9px', letterSpacing: '0.04em' }}
    >
      FARMING
    </Typography.Custom>
  </Wrapper>
);

FarmBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

FarmBadge.defaultProps = {
  isActive: false,
};

export default FarmBadge;
