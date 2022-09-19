import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useMedia } from 'react-use';

import { Typography } from '../../../Theme';
import { formatChartValueByType, getWeekFormattedDate } from '../../../utils';
import { Wrapper } from './styled';

const CrosshairTooltip = ({ title, active, isWeeklyActive, payload, dataType }) => {
  const below500 = useMedia('(max-width: 500px)');

  if (active && payload && payload.length) {
    const { time, value } = payload[0].payload;

    return (
      <Wrapper>
        <Typography.Text color={'text10'}>
          {isWeeklyActive ? getWeekFormattedDate(time, below500) : dayjs(time).format('MMMM D, YYYY')}
        </Typography.Text>
        <Typography.Text color={'text10'}>{title}</Typography.Text>
        <Typography.Text color={'text10'}>{formatChartValueByType(value, dataType)}</Typography.Text>
      </Wrapper>
    );
  }

  return null;
};

CrosshairTooltip.propTypes = {
  title: PropTypes.string,
  active: PropTypes.bool,
  isWeeklyActive: PropTypes.bool,
  payload: PropTypes.array,
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE']),
};

CrosshairTooltip.defaultProps = {
  dataType: 'CURRENCY',
};

export default CrosshairTooltip;
