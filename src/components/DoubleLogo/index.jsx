import PropTypes from 'prop-types';

import { CoveredLogo, HigherLogo, TokenWrapper } from './styled';

const DoubleTokenLogo = ({ a0, a1, defaultText0, defaultText1, size = 24, margin = false }) => (
  <TokenWrapper sizeraw={size} margin={margin}>
    <CoveredLogo defaultText={defaultText1} address={a1} size={size.toString() + 'px'} sizeraw={size} />
    <HigherLogo defaultText={defaultText0} address={a0} size={size.toString() + 'px'} sizeraw={size} />
  </TokenWrapper>
);

DoubleTokenLogo.propTypes = {
  a0: PropTypes.string,
  a1: PropTypes.string,
  defaultText0: PropTypes.string,
  defaultText1: PropTypes.string,
  size: PropTypes.number,
  margin: PropTypes.bool,
};

export default DoubleTokenLogo;
