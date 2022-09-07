import { Typography } from '../../Theme';
import { ReactComponent as FarmSvg } from '../../assets/svg/farm.svg';
import Icon from '../Icon';
import { Wrapper } from './styled';

const FarmBadge = () => (
  <Wrapper>
    <div>
      <Icon marginRight={'0'} icon={<FarmSvg height={13} width={22} />} />
    </div>
    <Typography.Custom
      color={'green1'}
      sx={{ fontWeight: 700, fontSize: '9px', lineHeight: '9px', letterSpacing: '0.04em' }}
    >
      FARMING
    </Typography.Custom>
  </Wrapper>
);

export default FarmBadge;
