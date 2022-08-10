import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: ${({ isMobile }) => (isMobile ? 'center' : 'flex-start')};
  gap: 8px;
`;

const ArrowBox = styled.div`
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.35) -120%, rgba(46, 23, 242, 0) 60%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), rgba(23, 22, 23);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);

  padding: 3px 7px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 4px;

  &:hover {
    cursor: ${({ isDisabled }) => (isDisabled ? 'arrow' : 'pointer')};
  }

  &:hover > * {
    color: ${({ isDisabled, theme }) => (isDisabled ? theme.bd1 : theme.text10)};
  }

  & > div {
    height: 16px;
  }
`;

const PageCounterBox = styled.div`
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.35) -120%, rgba(46, 23, 242, 0) 60%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), rgba(23, 22, 23);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);

  font-feature-settings: 'tnum';
  display: flex;
  justify-content: center;
  width: 68px;
  padding: 3px 7px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 4px;
`;

export { Wrapper, ArrowBox, PageCounterBox };
