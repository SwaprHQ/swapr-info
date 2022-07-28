import { PieChart } from 'react-feather';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { ReactComponent as BarChartSvg } from '../../assets/svg/bar-chart.svg';
import { ReactComponent as FeesSvg } from '../../assets/svg/fees.svg';
import { useGlobalData } from '../../contexts/GlobalData';
import { formattedNum, localNumber } from '../../utils';
import Icon from '../Icon';
import { StatsCard, Wrapper } from './styled';

const StatsValue = ({ children }) => (
  <Typography.Custom
    color={'text10'}
    sx={{ fontSize: '16px', lineHeight: '22px', letterSpacing: '0.02em', fontWeight: 600 }}
  >
    {children}
  </Typography.Custom>
);

export default function GlobalStats() {
  const below816 = useMedia('(max-width: 816px)');

  const { oneDayVolumeUSD, oneDayTxns, pairCount } = useGlobalData();

  const oneDayFees = oneDayVolumeUSD
    ? // FIXME: just know this is approximated, because each pair can have its own swap fee
      formattedNum(oneDayVolumeUSD * 0.0025, true)
    : '';

  return (
    <Wrapper isMobile={below816}>
      <StatsCard>
        <Flex>
          <Icon icon={<BarChartSvg height={16} width={16} />} />
          <Typography.LargeBoldText color={'text10'}>Transactions 24h</Typography.LargeBoldText>
        </Flex>
        <StatsValue>{!oneDayTxns ? <Skeleton style={{ width: '60px' }} /> : localNumber(oneDayTxns)}</StatsValue>
      </StatsCard>
      <StatsCard>
        <Flex>
          <Icon icon={<PieChart height={16} width={16} />} />
          <Typography.LargeBoldText color={'text10'}>Pairs</Typography.LargeBoldText>
        </Flex>
        <StatsValue>{!pairCount ? <Skeleton style={{ width: '60px' }} /> : localNumber(pairCount)}</StatsValue>
      </StatsCard>
      <StatsCard>
        <Flex>
          <Icon icon={<FeesSvg height={16} width={16} />} />
          <Typography.LargeBoldText color={'text10'}>Fees 24h</Typography.LargeBoldText>
        </Flex>
        <StatsValue>{!oneDayFees ? <Skeleton style={{ width: '60px' }} /> : oneDayFees}</StatsValue>
      </StatsCard>
    </Wrapper>
  );
}
