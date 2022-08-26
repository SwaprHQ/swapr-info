import { CheckCircle } from 'react-feather';
import styled from 'styled-components';

import { StyledIcon } from '..';
import { ReactComponent as ClipboardCopySvg } from '../../assets/svg/clipboard-copy.svg';
import { useCopyClipboard } from '../../hooks';

const CopyIcon = styled.div`
  display: flex;
  color: #aeaeae;
  flex-shrink: 0;
  margin-left: 4px;
  text-decoration: none;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    opacity: 0.8;
    cursor: pointer;
  }
`;
const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  color: black;
`;

export default function CopyHelper({ toCopy }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <StyledIcon>
            <CheckCircle size={'16'} />
          </StyledIcon>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <StyledIcon>
            <ClipboardCopySvg height={16} width={16} />
          </StyledIcon>
        </TransactionStatusText>
      )}
    </CopyIcon>
  );
}
