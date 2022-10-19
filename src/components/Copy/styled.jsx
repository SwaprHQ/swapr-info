import styled from 'styled-components';

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

export { CopyIcon, TransactionStatusText };
