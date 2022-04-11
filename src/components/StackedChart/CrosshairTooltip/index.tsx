import PropTypes from 'prop-types';
import React from 'react';

import { formattedNum } from '../../../utils';

const CrosshairTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="crosshair-custom-tooltip">
        {payload.map((series) => (
          <div key={series.name} className="crosshair-item">
            <div>
              <div className="crosshair-item-legend" style={{ backgroundColor: series.color }}></div>
              {series.name}
            </div>
            $ {formattedNum(series.value)}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

CrosshairTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default CrosshairTooltip;
