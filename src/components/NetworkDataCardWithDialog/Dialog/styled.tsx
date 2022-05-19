import { DialogContent, DialogOverlay } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { Minimize2 } from 'react-feather';
import styled from 'styled-components';

const CloseChartIcon = styled(Minimize2)`
  position: absolute;
  right: 0;
  color: ${({ theme }) => theme.text2};

  &:hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
  }
`;

const StyledDialogContent = styled(DialogContent)`
  &[data-reach-dialog-content] {
    width: 50vw;
    max-height: 380px;
    height: 100%;
    margin: 10vh auto;
    border-radius: 8px;
    border: ${({ theme }) => `1px solid ${theme.bg3}`};
    background: #1f2026;
    padding: 1.25rem;
    outline: none;
  }
`;

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: hsla(0, 0%, 0%, 0.33);
  position: fixed;
  inset: 0;
`;

const Wrapper = styled.div`
  position: relative;
`;

export { CloseChartIcon, StyledDialogContent, StyledDialogOverlay, Wrapper };
