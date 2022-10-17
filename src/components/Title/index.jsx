import { useHistory } from 'react-router-dom';
import { Flex } from 'rebass';
import styled from 'styled-components';

import Logo from '../../assets/svg/logo_white.svg';
import Wordmark from '../../assets/svg/wordmark_white.svg';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import Link from '../Link';
import { RowFixed } from '../Row';

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`;

export default function Title() {
  const isBelow350px = useIsBelowPx(350);
  const history = useHistory();

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <RowFixed>
          <Link id="link" onClick={() => history.push('/')}>
            <img width={'27px'} src={Logo} alt="logo" />
          </Link>
          {!isBelow350px && (
            <img width={'72px'} style={{ marginLeft: '8px', marginTop: '0px' }} src={Wordmark} alt="logo" />
          )}
        </RowFixed>
      </Flex>
    </TitleWrapper>
  );
}
