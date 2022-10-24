import PropTypes from 'prop-types';
import { Disc, Layers, List, PieChart, TrendingUp, X } from 'react-feather';
import { useHistory } from 'react-router-dom';

import Farms from '../../../assets/icons/Farm';
import { AutoColumn } from '../../Column';
import Icon from '../../Icon';
import { BasicLink } from '../../Link';
import Row from '../../Row';
import { Option, MobileOptionDivider } from '../styled';

export const MobileMenu = ({ onClose, ...rest }) => {
  const history = useHistory();

  return (
    <AutoColumn gap="1.25rem" style={{ padding: '24px' }} {...rest}>
      <Option isCentered={true} activeText={history.location.pathname === '/dashboard' ?? undefined}>
        <Layers size={20} style={{ marginRight: '.75rem' }} />
        <BasicLink to="/dashboard" onClick={onClose}>
          Dashboard
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Option isCentered={true} activeText={history.location.pathname === '/home' ?? undefined}>
        <TrendingUp size={20} style={{ marginRight: '.75rem' }} />
        <BasicLink to="/home" onClick={onClose}>
          Overview
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Option
        isCentered={true}
        activeText={
          (history.location.pathname.split('/')[1] === 'tokens' ||
            history.location.pathname.split('/')[1] === 'token') ??
          undefined
        }
      >
        <Disc size={20} style={{ marginRight: '.75rem' }} />
        <BasicLink to="/tokens" onClick={onClose}>
          Tokens
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Option
        isCentered={true}
        activeText={
          (history.location.pathname.split('/')[1] === 'pairs' || history.location.pathname.split('/')[1] === 'pair') ??
          undefined
        }
      >
        <PieChart size={20} style={{ marginRight: '.75rem' }} />

        <BasicLink to="/pairs" onClick={onClose}>
          Pairs
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Option isCentered={true} activeText={history.location.pathname.split('/')[1] === 'farming' ?? undefined}>
        <Icon
          icon={
            <Farms
              height={20}
              width={20}
              color={history.location.pathname.split('/')[1] === 'farming' ? 'text1' : 'text10'}
            />
          }
        />
        <BasicLink to="/farming" onClick={onClose}>
          Farming
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Option
        isCentered={true}
        activeText={
          (history.location.pathname.split('/')[1] === 'accounts' ||
            history.location.pathname.split('/')[1] === 'account') ??
          undefined
        }
      >
        <List size={20} style={{ marginRight: '.75rem' }} />
        <BasicLink to="/accounts" onClick={onClose}>
          Accounts
        </BasicLink>
      </Option>
      <MobileOptionDivider />
      <Row width="100%" justify="flex-end">
        <Icon icon={<X size={'20px'} />} color={'text1'} onClick={onClose} />
      </Row>
    </AutoColumn>
  );
};

MobileMenu.propTypes = {
  onClose: PropTypes.func.isRequired,
};
