import { useTransition, config, animated } from '@react-spring/web';
import React from 'react';

import LocalLoader from '../../LocalLoader';
import StackedChart from '../../StackedChart';
import { CloseChartIcon, StyledDialogContent, StyledDialogOverlay, Wrapper } from './styled';

const AnimatedDialogOverlay = animated(StyledDialogOverlay);
const AnimatedDialogContent = animated(StyledDialogContent);

interface DialogWithChartProps {
  title: string;
  historicalDataHook: any;
  isOpen: boolean;
  onClose: React.MouseEventHandler;
}

const DialogWithChart = ({ title, historicalDataHook, isOpen, onClose }: DialogWithChartProps) => {
  const data = historicalDataHook();

  const transitions = useTransition(isOpen, {
    config: { ...config.default, duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return transitions(
    ({ opacity }, item) =>
      item && (
        <AnimatedDialogOverlay isOpen={isOpen} onDismiss={onClose} style={{ opacity }}>
          <AnimatedDialogContent aria-label={'trades'}>
            {data && data.length > 0 ? (
              <Wrapper>
                <CloseChartIcon size={22} onClick={onClose} />
                <StackedChart title={title} type={'AREA'} data={data} isCurrency={false} showTimeFilter={false} />
              </Wrapper>
            ) : (
              <LocalLoader fill={false} height={undefined} />
            )}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      ),
  );
};

export default DialogWithChart;
