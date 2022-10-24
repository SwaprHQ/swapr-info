import LogoDark from '../../assets/svg/logo.svg';
import LogoWhite from '../../assets/svg/logo_white.svg';
import { useDarkModeManager } from '../../contexts/LocalStorage';
import { AnimatedImg, Wrapper } from './styled';

const LocalLoader = ({ fill, height }) => {
  const [darkMode] = useDarkModeManager();

  return (
    <Wrapper fill={fill} height={height}>
      <AnimatedImg>
        <img src={darkMode ? LogoWhite : LogoDark} alt="loading-icon" />
      </AnimatedImg>
    </Wrapper>
  );
};

export default LocalLoader;
