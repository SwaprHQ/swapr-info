import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { ReactComponent as CarrotDisabledSvg } from '../../assets/svg/carrot-disabled.svg';
import { ReactComponent as CarrotSvg } from '../../assets/svg/carrot.svg';
import Icon from '../Icon';
import { Wrapper } from './styled';

const CarrotBadge = ({ isActive }) => (
  <Wrapper isActive={isActive}>
    <div>
      <Icon
        marginRight={'0'}
        icon={isActive ? <CarrotSvg height={11} width={22} /> : <CarrotDisabledSvg height={11} width={22} />}
      />
    </div>
    <Typography.Custom
      color={isActive ? 'orange1' : 'mercuryGray'}
      sx={{ fontWeight: 700, fontSize: '9px', lineHeight: '9px', letterSpacing: '0.04em' }}
    >
      CARROT
    </Typography.Custom>
  </Wrapper>
);

CarrotBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

CarrotBadge.defaultProps = {
  isActive: false,
};

export default CarrotBadge;
