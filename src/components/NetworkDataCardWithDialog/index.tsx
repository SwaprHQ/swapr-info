import React, { useState } from 'react';

import { TYPE } from '../../Theme';
import { Networks } from '../../constants';
import { formattedNum } from '../../utils';
import DialogWithChart from './Dialog';
import { Wrapper, Content, Header, Icon, OpenChartIcon, Network, NetworkData, Title } from './styled';

interface NetworksValue {
  [Networks.ARBITRUM_ONE]: string | number;
  [Networks.MAINNET]: string | number;
  [Networks.XDAI]: string | number;
}

interface NetworkDataCardWithDialogProps {
  title: string;
  chartTitle: string;
  icon: React.ReactNode;
  networksValues: NetworksValue[];
  historicalDataHook: any;
}

const NetworkDataCardWithDialog = ({
  title,
  chartTitle,
  icon,
  networksValues,
  historicalDataHook,
}: NetworkDataCardWithDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen((value) => !value);
  };

  return (
    <Wrapper>
      <Header>
        <Title>
          <Icon>{icon}</Icon>
          <TYPE.header fontSize={16}>{title}</TYPE.header>
        </Title>
        <OpenChartIcon size={24} onClick={toggleDialog} />
      </Header>
      <Content>
        {Object.keys(networksValues).map((network, index) => (
          <NetworkData key={network} margin={index !== networksValues.length - 1}>
            <Network>{network}</Network>
            <TYPE.main fontSize={15}>{formattedNum(networksValues[network])}</TYPE.main>
          </NetworkData>
        ))}
      </Content>
      {isDialogOpen && (
        <DialogWithChart
          title={chartTitle}
          historicalDataHook={historicalDataHook}
          isOpen={isDialogOpen}
          onClose={toggleDialog}
        />
      )}
    </Wrapper>
  );
};

export default NetworkDataCardWithDialog;
