import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { ReactComponent as ClockSvg } from '../../assets/svg/clock.svg';
import Icon from '../Icon';
import LabeledValue from '../LabeledValue';
import { DailyChange } from './styled';

const DailyChangeLabel = ({ label, value, dailyChange }) => (
  <Flex justifyContent={'space-between'}>
    <LabeledValue label={label} value={value} />
    <Flex flexDirection={'column'} alignItems={'end'} style={{ gap: '8px' }}>
      <Flex alignItems={'center'} justifyContent={'end'}>
        <Icon icon={<ClockSvg height={16} width={16} />} />
        <Typography.SmallBoldText color={'text7'}>24H</Typography.SmallBoldText>
      </Flex>
      {dailyChange ? <DailyChange>{dailyChange}</DailyChange> : <Skeleton style={{ width: '40px', height: '14px' }} />}
    </Flex>
  </Flex>
);

DailyChangeLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  dailyChange: PropTypes.any,
};

export default DailyChangeLabel;
