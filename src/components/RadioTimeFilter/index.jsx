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
  filterOptions: PropTypes.object.isRequired,
  activeValue: PropTypes.string,
};

RadioTimeFilter.defaultProps = {
  filterOptions: {
    MONTH_1: '1M',
    MONTH_3: '3M',
    YEAR: '1Y',
  },
};

export default RadioTimeFilter;
