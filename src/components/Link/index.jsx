import { lighten, darken } from 'polished';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Link as RebassLink } from 'rebass';
import styled from 'styled-components';

const WrappedLink = ({ external, children, ...rest }) => (
  <RebassLink target={external ? '_blank' : null} rel={external ? 'noopener noreferrer' : null} {...rest}>
    {children}
  </RebassLink>
);

WrappedLink.propTypes = {
  external: PropTypes.bool,
};

const Link = styled(WrappedLink)`
  color: ${({ color, theme }) => (color ? theme[color] : theme.text10)};

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? theme[color] : theme.text8)};
  }
`;

export default Link;

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.swaprLink)};

  &:visited {
    color: ${({ color, theme }) => (color ? lighten(0.1, color) : lighten(0.1, theme.swaprLink))};
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.swaprLink))};
  }
`;

export const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: inherit;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`;

export const InternalLink = styled(RouterLink)`
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ color, theme }) => (color ? color : theme.text10)};

  & > div,
  & > * > div {
    color: ${({ color, theme }) => (color ? color : theme.text10)};
  }

  &:hover > div,
  &:hover > * > div {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.text8)};
    opacity: 0.7;
  }
`;
