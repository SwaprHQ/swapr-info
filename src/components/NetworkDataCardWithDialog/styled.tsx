import { BarChart2 } from 'react-feather';
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

const OpenChartIcon = styled(BarChart2)`
  color: ${({ theme }) => theme.text2};

  &:hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
  }
`;

const Value = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text1};
  font-weight: bold;
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
  text-align: ${(props: { align: string }) => props.align};
  text-transform: uppercase;
`;
export { Wrapper, Header, Title, OpenChartIcon, Value, Network, Data, Content, NetworkData };
