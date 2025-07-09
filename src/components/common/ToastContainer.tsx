import styled from 'styled-components';
import React from 'react';

const ToastContainerBox = styled.div`
  position: fixed;
  top: 32px;
  right: 32px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastContainerBox>{children}</ToastContainerBox>
);

export default ToastContainer; 