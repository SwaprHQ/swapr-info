import { Maximize2 } from 'react-feather';
import styled from 'styled-components';

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

const OpenChartIcon = styled(Maximize2)`
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
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const NetworkData = styled.div`
  margin-bottom: ${(props: { margin: boolean }) => (props.margin ? '12px' : '0')};
  margin-right: 36px;
`;

export { Header, Title, Icon, OpenChartIcon, Value, Network, Content, NetworkData };
