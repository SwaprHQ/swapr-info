import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { formattedNum } from '../../utils';
import { BarWrapper, ColoredBar, DarkBar, ProgressPercentage } from './styled';

const ProgressBar = ({ label, currentValue, progress }) => {
  return (
    <div>
      <Flex justifyContent={'space-between'}>
        <Typography.BoldText color={'text7'} sx={{ marginBottom: '6px' }}>
          {`${formattedNum(currentValue, true)} ${label}`}
        </Typography.BoldText>
        <ProgressPercentage progress={progress}>{`${Number(progress).toFixed(2)}%`}</ProgressPercentage>
      </Flex>
      <BarWrapper>
        <DarkBar />
        <ColoredBar progress={progress} />
      </BarWrapper>
    </div>
  );
};

ProgressBar.propTypes = {
  label: PropTypes.string,
  currentValue: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

export default ProgressBar;
