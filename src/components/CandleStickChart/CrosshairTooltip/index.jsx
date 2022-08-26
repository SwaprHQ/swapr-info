import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import { Typography } from '../../../Theme';
import { formattedNum } from '../../../utils';
import { Wrapper } from './styled';

const CrosshairTooltip = ({ title, active, isHourlyData, isCurrency, payload }) => {
  if (active && payload && payload.length) {
    const { time, low, high, up } = payload[0].payload;

    return (
      <Wrapper>
        <Typography.Text color={'text10'}>
          {dayjs(time).format(isHourlyData ? 'MMMM D, YYYY, HH:mm' : 'MMMM D, YYYY')}
        </Typography.Text>
        <Typography.Text color={'text10'}>{title}</Typography.Text>
        <Typography.Text color={'text10'}>Open: {formattedNum(up ? low : high, isCurrency)}</Typography.Text>
        <Typography.Text color={'text10'}>Close: {formattedNum(up ? high : low, isCurrency)}</Typography.Text>
      </Wrapper>
    );
  }

  return null;
};

CrosshairTooltip.propTypes = {
  title: PropTypes.string,
  active: PropTypes.bool,
  isHourlyData: PropTypes.bool,
  isCurrency: PropTypes.bool,
  payload: PropTypes.array,
};

export default CrosshairTooltip;
