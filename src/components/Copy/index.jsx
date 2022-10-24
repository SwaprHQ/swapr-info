import PropTypes from 'prop-types';
import { CheckCircle } from 'react-feather';

import { StyledIcon } from '..';
import { ReactComponent as ClipboardCopySvg } from '../../assets/svg/clipboard-copy.svg';
import { useCopyClipboard } from '../../hooks';
import { CopyIcon, TransactionStatusText } from './styled';

const CopyHelper = ({ toCopy }) => {
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
};

CopyHelper.propTypes = {
  toCopy: PropTypes.string,
};

export default CopyHelper;
