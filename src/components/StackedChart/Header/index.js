import PropTypes from 'prop-types';
import React from 'react';

import { Typography } from '../../../Theme';
import DropdownBasicSelect from '../../DropdownBasicSelect';
import { Container, DailyChange, Date, FlexContainer } from './styled';

const Header = ({
  title,
  value,
  dailyChange,
  date,
  filterOptions,
  activeFilter,
  onFilterChange,
  isValueCurrency,
  showTimeFilter,
}) => (
  <Container>
    <div>
      <Typography.smallHeader marginBottom={12} sx={{ textTransform: 'uppercase' }}>
        {title}
      </Typography.smallHeader>
      <FlexContainer>
        <Typography.largeBoldHeader marginRight={10}>
          {isValueCurrency && '$'} {value}
        </Typography.largeBoldHeader>
        <DailyChange>{dailyChange}</DailyChange>
      </FlexContainer>
      <Date>{date}</Date>
    </div>
    {showTimeFilter && (
      <div>
        <DropdownBasicSelect active={activeFilter} setActive={onFilterChange} options={filterOptions} width={80} />
      </div>
    )}
  </Container>
);

Header.propTypes = {
  title: PropTypes.string,
  dailyChange: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  date: PropTypes.string,
  filterOptions: PropTypes.object,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  isValueCurrency: PropTypes.bool,
  showTimeFilter: PropTypes.bool,
};

Header.defaultProps = {
  isValueCurrency: true,
  showTimeFilter: true,
};

export default Header;
