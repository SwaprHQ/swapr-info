import PropTypes from 'prop-types';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { Typography } from '../../../Theme';
import { TIME_FILTER_OPTIONS } from '../../../constants';
import { formatChartValueByType } from '../../../utils';
import RadioTimeFilter from '../../RadioTimeFilter';
import { Container, DailyChange, FlexContainer, WeeklyButton } from './styled';

const Header = ({
  title,
  value,
  dataType,
  dailyChange,
  date,
  filterOptions,
  activeFilter,
  isWeeklyActive,
  onFilterChange,
  onWeeklyToggle,
  showTimeFilter,
}) => {
  const below500 = useMedia('(max-width: 500px)');

  return (
    <Container>
      <div>
        <Typography.LargeBoldText color={'text7'} sx={{ textTransform: 'uppercase', marginBottom: '4px' }}>
          {title}
        </Typography.LargeBoldText>
        <Typography.LargeBoldHeader sx={{ marginRight: 10, marginBottom: '4px' }}>
          {formatChartValueByType(value, dataType, below500)}
        </Typography.LargeBoldHeader>
        <FlexContainer alignItems={'center'} flexDirection={'row'}>
          <Typography.Text color={'text7'}>{date}</Typography.Text>
          <DailyChange>{dailyChange}</DailyChange>
        </FlexContainer>
      </div>
      {showTimeFilter && (
        <Flex flexDirection={'column'} alignItems={'flex-end'} style={{ gap: '6px' }}>
          <RadioTimeFilter options={filterOptions} activeValue={activeFilter} onChange={onFilterChange} />
          {activeFilter !== TIME_FILTER_OPTIONS.WEEK && (
            <WeeklyButton onClick={onWeeklyToggle} isActive={isWeeklyActive}>
              <Typography.Text>BY WEEK</Typography.Text>
            </WeeklyButton>
          )}
        </Flex>
      )}
    </Container>
  );
};
Header.propTypes = {
  title: PropTypes.string,
  dailyChange: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE']),
  date: PropTypes.string,
  filterOptions: PropTypes.object,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  onWeeklyToggle: PropTypes.func.isRequired,
  showTimeFilter: PropTypes.bool,
  isWeeklyActive: PropTypes.bool,
};

Header.defaultProps = {
  dataType: 'CURRENCY',
  showTimeFilter: true,
};

export default Header;
