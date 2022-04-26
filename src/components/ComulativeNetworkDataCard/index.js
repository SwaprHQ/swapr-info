import PropTypes from 'prop-types';
import React from 'react';

import { TYPE } from '../../Theme';
import { NETWORK_COLORS } from '../../constants';
import { Header, Value, Content, Network, NetworkData, Title, Icon } from './styled';

const DataCard = ({ title, icon, comulativeValue, networksValues }) => (
  <>
    <Header>
      <Title>
        <Icon>{icon}</Icon>
        <TYPE.header fontSize={16}>{title}</TYPE.header>
      </Title>
      <Value>{comulativeValue}</Value>
    </Header>
    <Content>
      {networksValues.map(({ network, value }, index) => (
        <NetworkData key={network} margin={index !== networksValues.length - 1}>
          <Network color={NETWORK_COLORS[network]}>{network}</Network>
          <TYPE.main fontSize={15}>{value}</TYPE.main>
        </NetworkData>
      ))}
    </Content>
  </>
);

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  comulativeValue: PropTypes.any,
  networksValues: PropTypes.array,
};

export default DataCard;
