import { useTransition, config, animated } from '@react-spring/web';
import React from 'react';

import { useSwapsData } from '../../../contexts/Dashboard';
import LocalLoader from '../../LocalLoader';
import StackedChart from '../../StackedChart';
import { CloseChartIcon, StyledDialogContent, StyledDialogOverlay, Wrapper } from './styled';

const AnimatedDialogOverlay = animated(StyledDialogOverlay);
const AnimatedDialogContent = animated(StyledDialogContent);

interface DialogWithChartProps {
  isOpen: boolean;
  onClose: React.MouseEventHandler;
}

const DialogWithChart = ({ isOpen, onClose }: DialogWithChartProps) => {
  const swaps = useSwapsData();

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
            {swaps && swaps.length > 0 ? (
              <Wrapper>
                <CloseChartIcon size={22} onClick={onClose} />
                <StackedChart
                  title={'Trades (past month)'}
                  type={'AREA'}
                  data={swaps}
                  isCurrency={false}
                  showTimeFilter={false}
                />
              </Wrapper>
            ) : (
              <LocalLoader fill={false} />
            )}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      ),
  );
};

export default DialogWithChart;
