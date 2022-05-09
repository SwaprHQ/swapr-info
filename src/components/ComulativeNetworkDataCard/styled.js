import styled from 'styled-components';

const Wrapper = styled.div`
  height: 163px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Icon = styled.div`
  margin-right: 8px;
`;

const Value = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text1};
  font-weight: bold;
`;

const Network = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-left: 10%;
  padding-right: 10%;
`;

const NetworkData = styled.div`
  margin-bottom: ${({ margin }) => (margin ? '12px' : '0')};
  margin-right: 36px;
`;

export { Wrapper, Header, Title, Icon, Value, Network, Content, NetworkData };
