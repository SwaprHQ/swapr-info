import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { Button, Wrapper } from './styled';

const RadioTimeFilter = ({ onChange, options, activeValue }) => {
  return (
    <Wrapper>
      {Object.keys(options).map((key) => (
        <Button key={key} onClick={() => onChange(options[key])} isActive={activeValue === options[key]}>
          <Typography.LargeText sx={{ letterSpacing: '0.08em' }}>{options[key]}</Typography.LargeText>
        </Button>
      ))}
    </Wrapper>
  );
};

RadioTimeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  activeValue: PropTypes.string,
};

export default RadioTimeFilter;
