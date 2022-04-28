import PropTypes from 'prop-types';
import React from 'react';

import DropdownSelect from '../../DropdownSelect';
import { Container, Title, DailyChange, Date, FlexContainer, Value } from './styled';

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
      <Title>{title}</Title>
      <FlexContainer>
        <Value>
          {isValueCurrency && '$'} {value}
        </Value>
        <DailyChange>{dailyChange}</DailyChange>
      </FlexContainer>
      <Date>{date}</Date>
    </div>
    {showTimeFilter && (
      <div>
        <DropdownSelect active={activeFilter} setActive={onFilterChange} options={filterOptions} width={80} />
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
