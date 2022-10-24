import type { Placement } from '@popperjs/core';
import Portal from '@reach/portal';
import React, { useState } from 'react';
import { usePopper } from 'react-popper';

import useInterval from '../../hooks';
import { Arrow, PopoverContainer, ReferenceElement } from './styled';

export interface PopoverProps {
  content: React.ReactNode;
  show: boolean;
  children: React.ReactNode;
  placement?: Placement;
}

const Popover = ({ content, show, children, placement = 'auto' }: PopoverProps) => {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement>(null);
  const { styles, update, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    strategy: 'fixed',
    modifiers: [
      { name: 'offset', options: { offset: [8, 8] } },
      { name: 'arrow', options: { element: arrowElement } },
    ],
  });

  useInterval(update, show ? 100 : null);

  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <Portal>
        <PopoverContainer show={show} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          {content}
          <Arrow
            className={`arrow-${attributes.popper?.['data-popper-placement'] ?? ''}`}
            ref={setArrowElement}
            style={styles.arrow}
            {...attributes.arrow}
          />
        </PopoverContainer>
      </Portal>
    </>
  );
};

export default Popover;
