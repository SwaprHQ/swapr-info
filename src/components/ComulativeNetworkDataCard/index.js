import PropTypes from 'prop-types';
import React from 'react';

import { TYPE } from '../../Theme';
import Panel from '../Panel';
import { Header, Value, Content, Network, NetworkData } from './styled';

const DataCard = ({ title, icon, comulativeValue, networksValues }) => (
  <Panel>
    <Header>
      <span>
        {icon}
        <TYPE.header fontSize={16}>{title}</TYPE.header>
      </span>
      <Value>{comulativeValue}</Value>
    </Header>
    <Content>
      {networksValues.map(({ network, value }, index) => (
        <NetworkData key={network} margin={index !== networksValues.length - 1}>
          <Network>{network}</Network>
          <TYPE.main>{value}</TYPE.main>
        </NetworkData>
      ))}
    </Content>
  </Panel>
);

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  comulativeValue: PropTypes.number,
  networksValues: PropTypes.array,
};

export default DataCard;
