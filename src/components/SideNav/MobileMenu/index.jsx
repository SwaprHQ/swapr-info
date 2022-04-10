import React from 'react';
import { Disc, Layers, List, PieChart, TrendingUp, X } from 'react-feather';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Option } from '../';
import farming from '../../../assets/farming.svg';
import { AutoColumn } from '../../Column';
import { BasicLink } from '../../Link';
import Row from '../../Row';

const StyledIcon = styled(X)`
  color: #fff;
`;

export const MobileMenu = ({ onClose, ...rest }) => {
  const history = useHistory();

  return (
    <AutoColumn gap="1.25rem" style={{ padding: '24px' }} {...rest}>
      <BasicLink to="/dashboard" onClick={onClose}>
        <Option activeText={history.location.pathname === '/dashboard' ?? undefined}>
          <Layers size={20} style={{ marginRight: '.75rem' }} />
          Dashboard
        </Option>
      </BasicLink>
      <BasicLink to="/home" onClick={onClose}>
        <Option activeText={history.location.pathname === '/home' ?? undefined}>
          <TrendingUp size={20} style={{ marginRight: '.75rem' }} />
          Overview
        </Option>
      </BasicLink>
      <BasicLink to="/tokens" onClick={onClose}>
        <Option
          activeText={
            (history.location.pathname.split('/')[1] === 'tokens' ||
              history.location.pathname.split('/')[1] === 'token') ??
            undefined
          }
        >
          <Disc size={20} style={{ marginRight: '.75rem' }} />
          Tokens
        </Option>
      </BasicLink>
      <BasicLink to="/pairs" onClick={onClose}>
        <Option
          activeText={
            (history.location.pathname.split('/')[1] === 'pairs' ||
              history.location.pathname.split('/')[1] === 'pair') ??
            undefined
          }
        >
          <PieChart size={20} style={{ marginRight: '.75rem' }} />
          Pairs
        </Option>
      </BasicLink>
      <BasicLink to="/farming" onClick={onClose}>
        <Option
          activeText={
            (history.location.pathname.split('/')[1] === 'farming' ||
              history.location.pathname.split('/')[1] === 'farming') ??
            undefined
          }
        >
          <img style={{ marginRight: '.75rem' }} width={'20px'} src={farming} alt="farming" />
          Farming
        </Option>
      </BasicLink>

      <BasicLink to="/accounts" onClick={onClose}>
        <Option
          activeText={
            (history.location.pathname.split('/')[1] === 'accounts' ||
              history.location.pathname.split('/')[1] === 'account') ??
            undefined
          }
        >
          <List size={20} style={{ marginRight: '.75rem' }} />
          Accounts
        </Option>
      </BasicLink>

      <Row width="100%" justify="flex-end">
        <StyledIcon size="20px" onClick={onClose} />
      </Row>
    </AutoColumn>
  );
};
