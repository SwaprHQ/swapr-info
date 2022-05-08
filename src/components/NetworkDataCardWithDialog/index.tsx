import React, { useState } from 'react';

import { TYPE } from '../../Theme';
import { Networks } from '../../constants';
import { formattedNum } from '../../utils';
import DialogWithChart from './Dialog';
import { Content, Header, Icon, OpenChartIcon, Network, NetworkData, Title } from './styled';

interface NetworksValue {
  [Networks.ARBITRUM_ONE]: string | number;
  [Networks.MAINNET]: string | number;
  [Networks.XDAI]: string | number;
}

interface NetworkDataCardWithDialogProps {
  title: string;
  icon: React.ReactNode;
  networksValues: NetworksValue[];
}

const NetworkDataCardWithDialog = ({ title, icon, networksValues }: NetworkDataCardWithDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen((value) => !value);
  };

  return (
    <>
      <Header>
        <Title>
          <Icon>{icon}</Icon>
          <TYPE.header fontSize={16}>{title}</TYPE.header>
        </Title>
        <OpenChartIcon size={22} onClick={toggleDialog} />
      </Header>
      <Content>
        {Object.keys(networksValues).map((network) => (
          <NetworkData key={network} margin={false}>
            <Network>{network}</Network>
            <TYPE.main fontSize={15}>{formattedNum(networksValues[network])}</TYPE.main>
          </NetworkData>
        ))}
      </Content>
      {isDialogOpen && <DialogWithChart isOpen={isDialogOpen} onClose={toggleDialog} />}
    </>
  );
};

export default NetworkDataCardWithDialog;
