import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../../Theme';
import { formatChartValueByType } from '../../../utils';
import { Wrapper, LegendItem } from './styled';

const CrosshairTooltip = ({ active, payload, dataType }) => {
  if (active && payload && payload.length) {
    return (
      <Wrapper>
        {payload.map((series) => (
          <Flex key={series.name} alignItems={'center'} justifyContent={'space-between'}>
            <LegendItem color={series.color} />
            <Typography.Text color={'text10'}>{formatChartValueByType(series.value, dataType)}</Typography.Text>
          </Flex>
        ))}
      </Wrapper>
    );
  }

  return null;
};

CrosshairTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE', 'BASE']),
};

CrosshairTooltip.defaultProps = {
  dataType: 'CURRENCY',
};

export default CrosshairTooltip;
