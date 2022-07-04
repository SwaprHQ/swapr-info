import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 26px;
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
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.text8};
`;

const Network = styled.div`
  margin-bottom: 8px;
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.15em;
  color: ${({ theme }) => theme.text7};
`;

const Data = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.text6};
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const NetworkData = styled.div`
  text-align: ${({ align }) => align};
  text-transform: uppercase;
`;

export { Wrapper, Header, Title, Icon, Value, Network, Data, Content, NetworkData };
