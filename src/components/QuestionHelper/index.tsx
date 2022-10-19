import React, { useCallback, useState } from 'react';
import { HelpCircle as Question } from 'react-feather';

import Popover, { PopoverProps } from '../Popover';
import { QuestionWrapper, TooltipContainer } from './styled';

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: string;
}

export function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />;
}

const QuestionHelper = ({ text, disabled }: { text: string; disabled?: boolean }) => {
  const [show, setShow] = useState<boolean>(false);

  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show && !disabled}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <Question size={16} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  );
};

export default QuestionHelper;
