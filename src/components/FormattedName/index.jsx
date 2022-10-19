import PropTypes from 'prop-types';
import { useState } from 'react';

import { Tooltip } from '../QuestionHelper';
import { TextWrapper } from './styled';

const FormattedName = ({
  text,
  maxCharacters,
  margin = false,
  adjustSize = false,
  fontSize = 'inherit',
  link,
  ...rest
}) => {
  const [showHover, setShowHover] = useState(false);

  if (!text) {
    return null;
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={link}
          fontSize={fontSize}
          {...rest}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    );
  }

  return (
    <TextWrapper margin={margin} adjustSize={adjustSize} link={link} fontSize={fontSize} {...rest}>
      {text}
    </TextWrapper>
  );
};

FormattedName.propTypes = {
  text: PropTypes.string,
  maxCharacters: PropTypes.number,
  margin: PropTypes.bool,
  adjustSize: PropTypes.bool,
  fontSize: PropTypes.string,
};

export default FormattedName;
