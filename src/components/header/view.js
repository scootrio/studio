import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.colors.backgrounds.brand};
  color: ${({ theme }) => theme.colors.fonts.light};
  padding: 10px;
`;

function HeaderView() {
  return (
    <Header>
      <h2>Mooter</h2>
    </Header>
  );
}

export default HeaderView;
