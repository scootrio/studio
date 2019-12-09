import React from 'react';
import styled from 'styled-components';

const BlueprintViewRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;
`;

export default function BlueprintView({ children }) {
  return <BlueprintViewRoot>{children}</BlueprintViewRoot>;
}
