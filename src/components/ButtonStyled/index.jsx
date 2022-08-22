import { darken, transparentize } from 'polished';
import { Plus, ChevronDown, ChevronUp } from 'react-feather';
import { Button as RebassButton } from 'rebass/styled-components';
import styled from 'styled-components';

import { StyledIcon } from '..';
import { RowBetween } from '../Row';

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  outline: none;
  border-bottom-right-radius: ${({ open }) => open && '0'};
  border-bottom-left-radius: ${({ open }) => open && '0'};
`;

const BaseCustom = styled(RebassButton)`
  padding: 16px 12px;
  font-size: 0.825rem;
  font-weight: 400;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
`;

const Dull = styled(Base)`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: black;
  height: 100%;
  font-weight: 400;
  &:hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 1pt rgba(255, 255, 255, 0.25);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

export default function ButtonStyled({ children, ...rest }) {
  return <Base {...rest}>{children}</Base>;
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ButtonLight = styled(Base)`
  min-width: 148px;
  height: 32px;

  background-color: ${({ color, theme }) =>
    color ? transparentize(0.9, color) : transparentize(0.9, theme.swaprLink)};

  background: linear-gradient(118.9deg, rgba(255, 255, 255, 0.2) -0.59%, rgba(0, 0, 0, 0) 132.78%),
    linear-gradient(0deg, #171621, #171621), rgba(61, 55, 88, 0.7);
  background-blend-mode: overlay, normal, normal;
  backdrop-filter: blur(25px);

  border: ${({ theme }) => `1px solid ${theme.bd1}`};
  border-radius: 8px;

  min-width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  a {
    color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.swaprLink)};
  }

  :hover > * {
    color: ${({ theme }) => theme.text8};
  }
`;

export function ButtonDropdown({ disabled = false, children, open, ...rest }) {
  return (
    <ButtonFaded {...rest} disabled={disabled} ope={open}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        {open ? (
          <StyledIcon>
            <ChevronUp size={24} />
          </StyledIcon>
        ) : (
          <StyledIcon>
            <ChevronDown size={24} />
          </StyledIcon>
        )}
      </RowBetween>
    </ButtonFaded>
  );
}

export const ButtonDark = styled(Base)`
  min-width: 148px;
  height: 32px;

  background: linear-gradient(118.9deg, rgba(255, 255, 255, 0.2) -0.59%, rgba(0, 0, 0, 0) 132.78%),
    rgba(61, 55, 88, 0.7);
  background-blend-mode: overlay, normal;
  backdrop-filter: blur(25px);

  border: ${({ theme }) => `1px solid ${theme.bd1}`};
  border-radius: 8px;
`;

export const ButtonFaded = styled(Base)`
  background-color: ${({ theme }) => theme.bg2};
  color: (255, 255, 255, 0.5);
  white-space: nowrap;

  :hover {
    opacity: 0.5;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      </ContentWrapper>
    </Dull>
  );
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom bg={bgColor} color={color} {...rest}>
      {children}
    </BaseCustom>
  );
}

export const OptionButton = styled.div`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  background-color: ${({ active, theme }) => active && theme.bg3};
  color: ${({ theme }) => theme.text1};

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }
`;
