import PropTypes from 'prop-types';
import React from 'react';

import { TYPE } from '../../Theme';
import { Wrapper, Header, Value, Content, Network, NetworkData, Title } from './styled';

const DataCard = ({ title, icon, comulativeValue, networksValues }) => (
  <Wrapper>
    <Header>
      <Title>
        {icon}
        <TYPE.header fontSize={16}>{title}</TYPE.header>
      </Title>
      <Value>{comulativeValue}</Value>
    </Header>
    <Content>
      {networksValues.map(({ network, value }, index) => (
        <NetworkData key={network} margin={index !== networksValues.length - 1}>
          <Network>{network}</Network>
          <TYPE.main fontSize={15}>{value}</TYPE.main>
        </NetworkData>
      ))}
    </Content>
  </Wrapper>
);

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  comulativeValue: PropTypes.any,
  networksValues: PropTypes.array,
};

export default DataCard;
