import styled from 'styled-components';

const TextWrapper = styled.div`
  position: relative;
  margin-left: ${({ margin }) => margin && '4px'};
  color: ${({ theme, link }) => (link ? theme.swaprLink : theme.text1)};
  font-size: ${({ fontSize }) => fontSize};
  flex-basis: ${({ flexBasis }) => (flexBasis ? flexBasis : '')};
  text-align: ${({ textAlign }) => (textAlign ? textAlign : '')};

  :hover {
    cursor: ${({ link }) => (link ? 'pointer' : 'default')};
  }

  @media screen and (max-width: 600px) {
    font-size: ${({ adjustSize }) => adjustSize && '12px'};
  }
`;

export { TextWrapper };
