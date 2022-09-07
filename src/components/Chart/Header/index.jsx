import PropTypes from 'prop-types';

import { Typography } from '../../../Theme';
import { formatChartValueByType } from '../../../utils';
import RadioTimeFilter from '../../RadioTimeFilter';
import { Container, DailyChange, FlexContainer } from './styled';

const Header = ({
  title,
  value,
  dataType,
  dailyChange,
  date,
  filterOptions,
  activeFilter,
  onFilterChange,
  showTimeFilter,
}) => (
  <Container>
    <div>
      <Typography.LargeBoldText color={'text7'} sx={{ textTransform: 'uppercase', marginBottom: '4px' }}>
        {title}
      </Typography.LargeBoldText>
      <Typography.LargeBoldHeader sx={{ marginRight: 10, marginBottom: '4px' }}>
        {formatChartValueByType(value, dataType)}
      </Typography.LargeBoldHeader>
      <FlexContainer>
        <Typography.Text color={'text7'}>{date}</Typography.Text>
        <DailyChange>{dailyChange}</DailyChange>
      </FlexContainer>
    </div>
    {showTimeFilter && (
      <div>
        <RadioTimeFilter options={filterOptions} activeValue={activeFilter} onChange={onFilterChange} />
      </div>
    )}
  </Container>
);

Header.propTypes = {
  title: PropTypes.string,
  dailyChange: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE']).isRequired,
  date: PropTypes.string,
  filterOptions: PropTypes.object,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  showTimeFilter: PropTypes.bool,
};

Header.defaultProps = {
  isValueCurrency: true,
  showTimeFilter: true,
};

export default Header;
