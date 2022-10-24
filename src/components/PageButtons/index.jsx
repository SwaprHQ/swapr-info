import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'react-feather';

import { Typography } from '../../Theme';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import Icon from '../Icon';
import { Wrapper, ArrowBox, PageCounterBox } from './styled';

const PageButtons = ({ activePage, maxPages, onNextClick, onPreviousClick }) => {
  const below600 = useIsBelowPx(600);

  return (
    <Wrapper isMobile={below600}>
      <ArrowBox isDisabled={activePage === 1} onClick={onPreviousClick}>
        <Icon marginRight={'0'} color={'bd1'} icon={<ChevronLeft size={16} />} />
      </ArrowBox>
      <PageCounterBox>
        <Typography.Custom
          color={'text1'}
          sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, marginRight: '6px', userSelect: 'none' }}
        >
          {activePage}
        </Typography.Custom>
        <Typography.Custom
          color={'text1'}
          sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, marginRight: '6px', userSelect: 'none' }}
        >
          /
        </Typography.Custom>
        <Typography.Custom
          color={'text10'}
          sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, userSelect: 'none' }}
        >
          {maxPages}
        </Typography.Custom>
      </PageCounterBox>
      <ArrowBox isDisabled={activePage === maxPages} onClick={onNextClick}>
        <Icon marginRight={'0'} color={'bd1'} icon={<ChevronRight size={16} />} />
      </ArrowBox>
    </Wrapper>
  );
};

PageButtons.propTypes = {
  activePage: PropTypes.number.isRequired,
  maxPages: PropTypes.number.isRequired,
  onNextClick: PropTypes.func.isRequired,
  onPreviousClick: PropTypes.func.isRequired,
};

export default PageButtons;
