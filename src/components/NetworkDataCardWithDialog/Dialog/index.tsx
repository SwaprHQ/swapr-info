import { useTransition, config, animated } from '@react-spring/web';
import React from 'react';

import LocalLoader from '../../LocalLoader';
import StackedChart from '../../StackedChart';
import { StyledDialogContent, StyledDialogOverlay, Wrapper } from './styled';

const AnimatedDialogOverlay = animated(StyledDialogOverlay);
const AnimatedDialogContent = animated(StyledDialogContent);

interface DialogWithChartProps {
  title: string;
  historicalDataHook: any;
  isOpen: boolean;
  isTimeFilterVisible: boolean;
  defaultTimeFilter: '1M' | '3M' | '1Y';
  formatActiveDate: any;
  onClose: React.MouseEventHandler;
}

const DialogWithChart = ({
  title,
  historicalDataHook,
  isOpen,
  isTimeFilterVisible,
  defaultTimeFilter = '1M',
  formatActiveDate = null,
  onClose,
}: DialogWithChartProps) => {
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
                <StackedChart
                  title={title}
                  type={'AREA'}
                  data={data}
                  dataType={'BASE'}
                  showTimeFilter={isTimeFilterVisible}
                  formatActiveDate={formatActiveDate}
                  defaultTimeFilter={defaultTimeFilter}
                />
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
