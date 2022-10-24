import PropTypes from 'prop-types';
import { isMobile } from 'react-device-detect';
import { default as ReactSelect } from 'react-select';

import Popout from './popout';
import {
  customStyles,
  customStylesMobile,
  customStylesTime,
  MenuLabel,
  LogoBox,
  LabelBox,
  CustomMenu,
  FixedToggle,
} from './styles';

let addressStart = new RegExp('^0x');
function customFilter(option, searchText) {
  const isAddress = addressStart.test(searchText);
  if (isAddress) {
    return option.data.tokenAddress.toString().toLowerCase().includes(searchText.toString().toLowerCase());
  }
  return option.data.label.toString().toLowerCase().includes(searchText.toString().toLowerCase());
}

const Select = ({ options, onChange, setCapEth, capEth, tokenSelect = false, placeholder, ...rest }) => {
  return tokenSelect ? (
    <ReactSelect
      placeholder={placeholder}
      isSearchable={true}
      onChange={onChange}
      options={options}
      value={placeholder}
      filterOption={customFilter}
      getOptionLabel={(option) => (
        <MenuLabel>
          <LogoBox>{option.logo}</LogoBox>
          <LabelBox>{option.label}</LabelBox>
        </MenuLabel>
      )}
      styles={isMobile ? customStylesMobile : customStyles}
      {...rest}
      components={{
        DropdownIndicator: () => (
          <span role="img" aria-label={'viewer'} style={{ marginRight: '8px' }}>
            🔎
          </span>
        ),

        Menu: ({ children, innerRef, innerProps }) => {
          return (
            <CustomMenu ref={innerRef} {...innerProps}>
              <FixedToggle>
                <input
                  name="isGoing"
                  type="checkbox"
                  checked={capEth}
                  onChange={() => {
                    setCapEth(!capEth);
                  }}
                />
                Hide Low Liquidity
              </FixedToggle>
              {children}
            </CustomMenu>
          );
        },
      }}
    />
  ) : (
    <ReactSelect
      placeholder={placeholder}
      isSearchable={true}
      onChange={onChange}
      options={options}
      styles={customStylesTime}
      {...rest}
    />
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

export default Select;

export { Popout };
