import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle } from '@fortawesome/free-regular-svg-icons';

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  background-color: transparent;
`;

function InternalEventIcon({}, ref) {
  return (
    <IconWrapper ref={ref}>
      <FontAwesomeIcon icon={faDotCircle} size={"2x"} />
    </IconWrapper>
  );
}

export default forwardRef(InternalEventIcon);