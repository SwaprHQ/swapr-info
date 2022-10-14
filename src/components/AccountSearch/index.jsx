import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { isAddress } from '../../utils';
import { ButtonDark } from '../ButtonStyled';
import { AutoColumn } from '../Column';
import { Input, Wrapper } from './styled';

function AccountSearch({ history, isSmall }) {
  const [accountValue, setAccountValue] = useState();

  const handleAccountSearch = () => {
    if (isAddress(accountValue)) {
      history.push('/account/' + accountValue);
    }
  };

  const handleEnterPressed = (event) => {
    if (event.key === 'Enter') {
      handleAccountSearch();
    }
  };

  return (
    <AutoColumn gap={'1rem'}>
      <Flex
        flexDirection={isSmall ? 'column' : 'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        style={{ gap: '20px' }}
      >
        <Wrapper>
          <Input
            placeholder={'Search Wallet / Account'}
            onKeyDownCapture={handleEnterPressed}
            onChange={(e) => {
              setAccountValue(e.target.value);
            }}
          />
        </Wrapper>
        <ButtonDark onClick={handleAccountSearch} style={{ height: '46px', width: isSmall ? '100%' : 'initial' }}>
          <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
            LOAD DETAILS
          </Typography.SmallBoldText>
        </ButtonDark>
      </Flex>
    </AutoColumn>
  );
}

export default withRouter(AccountSearch);
