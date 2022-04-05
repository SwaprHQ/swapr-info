import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import DropdownSelect from "../../DropdownSelect";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
`;

const Title = styled.p`
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Value = styled.p`
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  margin-right: 16px;
`;

const DailyChange = styled.div`
  display: inline-block;
  font-size: 16px;
  font-weight: 500;
`;

const Date = styled.p`
  font-size: 12px;
  margin-top: 0;
`;

const Header = ({
  title,
  value,
  dailyChange,
  date,
  filterOptions,
  activeFilter,
  onFilterChange,
}) => (
  <Container>
    <div>
      <Title>{title}</Title>
      <FlexContainer>
        <Value>$ {value}</Value>
        <DailyChange>{dailyChange}</DailyChange>
      </FlexContainer>
      <Date>{date}</Date>
    </div>
    <div>
      <DropdownSelect
        active={activeFilter}
        setActive={onFilterChange}
        options={filterOptions}
        width={80}
      />
    </div>
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
};

export default Header;
