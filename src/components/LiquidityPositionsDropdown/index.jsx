import { PropTypes } from 'prop-types';
import { useState, useMemo, useRef } from 'react';
import { ChevronDown, MoreHorizontal } from 'react-feather';
import { useClickAway } from 'react-use';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { useDarkModeManager } from '../../contexts/LocalStorage';
import DoubleTokenLogo from '../DoubleLogo';
import Icon from '../Icon';
import { Dropdown, LiquidityPosition, Wrapper } from './styled';

const LiquidityPositionsDropdown = ({ liquidityMiningPositions, active, setActive, width }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const darkMode = useDarkModeManager();

  const activeLiquidityMiningPosition = useMemo(
    () =>
      active && liquidityMiningPositions.find((liquidityMiningPosition) => liquidityMiningPosition.key === active.key),
    [liquidityMiningPositions, active],
  );

  useClickAway(dropdownRef, (event) => {
    if (isDropdownOpen && !containerRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  });

  return (
    <Wrapper open={isDropdownOpen} width={width} ref={containerRef}>
      <Flex onClick={() => setIsDropdownOpen(!isDropdownOpen)} justifyContent={'space-between'} width={'100%'}>
        <Flex style={{ gap: '8px' }} alignItems={'center'}>
          {activeLiquidityMiningPosition && activeLiquidityMiningPosition.key !== 'all' && (
            <DoubleTokenLogo
              a0={activeLiquidityMiningPosition.pair.token0.id}
              a1={activeLiquidityMiningPosition.pair.token1.id}
              size={16}
            />
          )}
          {activeLiquidityMiningPosition && activeLiquidityMiningPosition.key === 'all' && (
            <Icon icon={<MoreHorizontal height={19} />} color={'text1'} marginRight={'0'} />
          )}
          <Typography.SmallHeader
            color={'text8'}
            sx={{
              userSelect: 'none',
            }}
          >
            {activeLiquidityMiningPosition && activeLiquidityMiningPosition.label}
          </Typography.SmallHeader>
        </Flex>
        <Icon icon={<ChevronDown height={19} />} color={'text8'} marginRight={'0'} />
      </Flex>
      {isDropdownOpen && (
        <Dropdown>
          <div ref={dropdownRef}>
            <Flex style={{ gap: '20px' }} flexDirection={'column'}>
              {liquidityMiningPositions.map((liquidityMiningPosition) => {
                return (
                  liquidityMiningPosition.key !== active?.key && (
                    <LiquidityPosition
                      key={liquidityMiningPosition.key}
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        setActive(liquidityMiningPosition);
                      }}
                    >
                      {liquidityMiningPosition.key === 'all' ? (
                        <Icon icon={<MoreHorizontal height={16} />} color={'text1'} marginRight={'0'} />
                      ) : (
                        <DoubleTokenLogo
                          a0={liquidityMiningPosition.pair.token0.id}
                          a1={liquidityMiningPosition.pair.token1.id}
                          size={16}
                        />
                      )}
                      <Typography.SmallHeader
                        color={'text8'}
                        sx={{
                          display: 'flex',
                          ':hover': { color: darkMode ? '#EBE9F8' : '#464366' },
                          userSelect: 'none',
                        }}
                      >
                        {liquidityMiningPosition.label}
                      </Typography.SmallHeader>
                    </LiquidityPosition>
                  )
                );
              })}
            </Flex>
          </div>
        </Dropdown>
      )}
    </Wrapper>
  );
};

LiquidityPositionsDropdown.propTypes = {
  liquidityMiningPositions: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired }),
  ),
  width: PropTypes.string,
};

export default LiquidityPositionsDropdown;
