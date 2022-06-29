import { Box as RebassBox } from 'rebass';
import styled, { css } from 'styled-components';

const panelPseudo = css`
  :after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
  }

  @media only screen and (min-width: 40em) {
    :after {
      content: unset;
    }
  }
`;

const Panel = styled(RebassBox)`
  position: relative;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -120%, rgba(46, 23, 242, 0) 60%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), rgba(23, 22, 23);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);
  padding: 1.25rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bd1};

  :hover {
    cursor: ${({ hover }) => hover && 'pointer'};
    border: ${({ hover, theme }) => hover && '1px solid' + theme.bg5};
  }

  ${(props) => (props.area ? `grid-area: ${props.area};` : null)}

  ${(props) => (props.padding ? `padding: ${props.padding};` : null)}
  

  ${(props) =>
    props.grouped &&
    css`
      @media only screen and (min-width: 40em) {
        &:first-of-type {
          border-radius: 20px 20px 0 0;
        }
        &:last-of-type {
          border-radius: 0 0 20px 20px;
        }
      }
    `}

  ${(props) =>
    props.rounded &&
    css`
      border-radius: 8px;
      @media only screen and (min-width: 40em) {
        border-radius: 10px;
      }
    `};

  ${(props) => !props.last && panelPseudo}
`;

export default Panel;
