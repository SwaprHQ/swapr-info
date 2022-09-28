import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { ReactComponent as CarrotSvg } from '../../assets/svg/carrot.svg';
import { ChainId } from '../../constants';
import { useSelectedNetwork } from '../../contexts/Network';
import { getCarrotCampaignLink } from '../../utils';
import Icon from '../Icon';
import Link from '../Link';
import { Wrapper } from './styled';

const GoToCampaignLink = ({ campaignId }) => {
  const network = useSelectedNetwork();

  return (
    <Link external={true} href={getCarrotCampaignLink(campaignId, ChainId[network])}>
      <Wrapper>
        <div>
          <Icon marginRight={'0'} icon={<CarrotSvg height={11} width={22} />} />
        </div>
        <Typography.Custom
          color={'orange1'}
          sx={{ fontWeight: 700, fontSize: '9px', lineHeight: '9px', letterSpacing: '0.04em' }}
        >
          GO TO CAMPAIGN
        </Typography.Custom>
      </Wrapper>
    </Link>
  );
};

GoToCampaignLink.propTypes = {
  campaignId: PropTypes.string,
};

export default GoToCampaignLink;
