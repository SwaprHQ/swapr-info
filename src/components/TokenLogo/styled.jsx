import styled from 'styled-components';

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  flex-basis: ${({ flexBasis }) => flexBasis};
  justify-content: ${({ justifyContent }) => justifyContent};
`;

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 50%;
  padding: 1px;
`;

export { Inline, Image };
