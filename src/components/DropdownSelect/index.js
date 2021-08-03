import React, { useRef, useState } from "react";
import styled from "styled-components";

import Row, { RowBetween } from "../Row";
import { AutoColumn } from "../Column";
import { ChevronDown as Arrow } from "react-feather";
import { TYPE } from "../../Theme";
import { StyledIcon } from "..";
import { useClickAway } from "react-use";

const Wrapper = styled.div`
  z-index: 20;
  position: relative;
  background-color: ${({ theme }) => theme.panelColor};
  border: 1px solid ${({ color }) => color};
  width: 100px;
  padding: 4px 10px;
  padding-right: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 38px;
  padding-top: 40px;
  width: calc(100% - 40px);
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 10px 10px;
  border-radius: 8px;
  width: calc(100% - 20px);
  font-weight: 500;
  font-size: 1rem;
  color: black;
  :hover {
    cursor: pointer;
  }
`;

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`;

const DropdownSelect = ({ options, active, setActive, color }) => {
  const [showDropdown, toggleDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  useClickAway(dropdownRef, (event) => {
    if (showDropdown && !containerRef.current.contains(event.target))
      toggleDropdown(false);
  });

  return (
    <Wrapper open={showDropdown} color={color} ref={containerRef}>
      <RowBetween
        onClick={() => toggleDropdown(!showDropdown)}
        justify="center"
      >
        <TYPE.main>{active}</TYPE.main>
        <StyledIcon>
          <ArrowStyled />
        </StyledIcon>
      </RowBetween>
      {showDropdown && (
        <Dropdown>
          <div ref={dropdownRef}>
            <AutoColumn gap="20px">
              {Object.keys(options).map((key, index) => {
                let option = options[key];
                return (
                  option !== active && (
                    <Row
                      onClick={() => {
                        toggleDropdown(!showDropdown);
                        setActive(option);
                      }}
                      key={index}
                    >
                      <TYPE.body fontSize={14}>{option}</TYPE.body>
                    </Row>
                  )
                );
              })}
            </AutoColumn>
          </div>
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default DropdownSelect;
