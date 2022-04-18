import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Value = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const Network = styled.div`
  font-size: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const NetworkData = styled.div`
  margin-bottom: ${({ margin }) => (margin ? '12px' : '0')};
`;

export { Header, Value, Network, Content, NetworkData };
