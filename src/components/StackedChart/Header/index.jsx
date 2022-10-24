import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../../Theme';
import { useIsBelowPx } from '../../../hooks/useIsBelowPx';
import { formatChartDate, formatChartValueByType } from '../../../utils';
import RadioTimeFilter from '../../RadioTimeFilter';
import { Container, DailyChange } from './styled';

const Header = ({
  title,
  value,
  dailyChange,
  date,
  filterOptions,
  activeFilter,
  onFilterChange,
  dataType,
  showTimeFilter,
}) => {
  const isBelow500px = useIsBelowPx(500);

  return (
    <Container>
      <div>
        <Typography.LargeBoldText color={'text7'} sx={{ textTransform: 'uppercase', marginBottom: '4px' }}>
          {title}
        </Typography.LargeBoldText>
        <Flex>
          <Typography.LargeBoldHeader sx={{ marginRight: 10 }}>
            {formatChartValueByType(value, dataType, isBelow500px)}
          </Typography.LargeBoldHeader>
        </Flex>
        <Flex alignItems={'center'} style={{ gap: '6px' }}>
          <Typography.Text color={'text7'}>{formatChartDate(date, false, isBelow500px)}</Typography.Text>
          <DailyChange>{dailyChange}</DailyChange>
        </Flex>
      </div>
      {showTimeFilter && (
        <div>
          <RadioTimeFilter options={filterOptions} activeValue={activeFilter} onChange={onFilterChange} />
        </div>
      )}
    </Container>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  dailyChange: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  date: PropTypes.string,
  filterOptions: PropTypes.object,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE', 'BASE']),
  showTimeFilter: PropTypes.bool,
};

Header.defaultProps = {
  dataType: 'CURRENCY',
  showTimeFilter: true,
};

export default Header;
