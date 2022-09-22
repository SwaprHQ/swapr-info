import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 12px;
  padding: 16px;

  min-width: 306px;
  height: 147px;

  background: ${({ isActive }) =>
    isActive
      ? 'linear-gradient(226.13deg, rgba(15, 152, 106, 0.2) -7.71%, rgba(15, 152, 106, 0) 85.36%), linear-gradient(113.18deg, rgba(255, 255, 255, 0.15) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621;'
      : 'linear-gradient(226.13deg, rgba(190, 42, 70, 0.2) -7.71%, rgba(190, 42, 70, 0) 85.36%), linear-gradient(113.18deg, rgba(255, 255, 255, 0.15) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621;'}
  background-blend-mode: normal, overlay, normal;

  :hover {
    cursor: pointer;
    opacity: 0.6;
  }

  transition: opacity 200ms;

  @media screen and (max-width: 600px) {
    min-width: 0;
  }
`;

export { Wrapper };
