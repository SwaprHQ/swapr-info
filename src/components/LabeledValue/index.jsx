import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';

const LabeledValue = ({ label, value }) => (
  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
    <Typography.Custom color={'text7'} sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}>
      {label}
    </Typography.Custom>
    <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
      {value}
    </Typography.LargeBoldText>
  </Flex>
);

LabeledValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};

export default LabeledValue;
