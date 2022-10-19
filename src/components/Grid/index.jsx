import PropTypes from 'prop-types';
import { Box } from 'rebass';

const Grid = ({ gridTemplateColumns, gridGap, justifySelf, ...props }) => (
  <Box {...props} sx={{ display: 'grid', gridTemplateColumns, gridGap, justifySelf }}></Box>
);

Grid.propTypes = {
  gridTemplateColumns: PropTypes.string,
  gridGap: PropTypes.string,
  justifySelf: PropTypes.string,
};

export { Grid };
