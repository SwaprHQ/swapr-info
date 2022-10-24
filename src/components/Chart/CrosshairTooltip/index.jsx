import PropTypes from 'prop-types';

import { Typography } from '../../../Theme';
import { useIsBelowPx } from '../../../hooks/useIsBelowPx';
import { formatChartDate, formatChartValueByType } from '../../../utils';
import { Wrapper } from './styled';

const CrosshairTooltip = ({ title, active, isWeeklyActive, payload, dataType }) => {
  const isBelow500px = useIsBelowPx(500);

  if (active && payload && payload.length) {
    const { time, value } = payload[0].payload;

    return (
      <Wrapper>
        <Typography.Text color={'text10'}>{formatChartDate(time, isWeeklyActive, isBelow500px)}</Typography.Text>
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
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE', 'BASE']),
};

CrosshairTooltip.defaultProps = {
  dataType: 'CURRENCY',
};

export default CrosshairTooltip;
