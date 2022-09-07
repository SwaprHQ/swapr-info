import { Typography } from '../../Theme';
import { ReactComponent as CarrotSvg } from '../../assets/svg/carrot.svg';
import Icon from '../Icon';
import { Wrapper } from './styled';

const CarrotBadge = () => (
  <Wrapper>
    <div>
      <Icon marginRight={'0'} icon={<CarrotSvg height={11} width={22} />} />
    </div>
    <Typography.Custom
      color={'orange1'}
      sx={{ fontWeight: 700, fontSize: '9px', lineHeight: '9px', letterSpacing: '0.04em' }}
    >
      CARROT
    </Typography.Custom>
  </Wrapper>
);

export default CarrotBadge;
