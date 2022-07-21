import { Typography } from '../../Theme';
import { useSessionStart } from '../../contexts/Application';
import { InlineLink, PollingDot, Wrapper } from './styled';

const Polling = () => {
  const seconds = useSessionStart();

  return (
    <Wrapper>
      <InlineLink href="/">
        <Typography.tinyText sx={{ marginRight: '6px' }} color={'text10'}>
          Updated
        </Typography.tinyText>
        <Typography.tinyText sx={{ marginRight: '6px' }} color={'green1'}>
          {seconds ? seconds : '-'}s ago
        </Typography.tinyText>
        <PollingDot />
      </InlineLink>
    </Wrapper>
  );
};

export default Polling;
