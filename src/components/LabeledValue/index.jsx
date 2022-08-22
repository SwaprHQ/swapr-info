import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';

const LabeledValue = ({ label, value }) => (
  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
    <Typography.Custom color={'text7'} sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}>
      {label}
    </Typography.Custom>
    {value ? (
      <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
        {value}
      </Typography.LargeBoldText>
    ) : (
      <Skeleton style={{ width: '120px', height: '14px' }} />
    )}
  </Flex>
);

LabeledValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};

export default LabeledValue;
