import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div<{ width?: string }>`
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 0;
  min-width: 320px;
  max-width: 96vw;
  width: ${({ width }) => width || '600px'};
  position: relative;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: #bdbdbd;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
  padding: 18px 24px 12px 24px;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseBtn = styled.button`
  background: #fff;
  border: 2px solid #bdbdbd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-left: 12px;
  &:hover {
    background: #e0e0e0;
  }
`;

const ModalBody = styled.div`
  padding: 24px 24px 32px 24px;
  background: #f5f5f5;
  color: #222;
  font-size: 1.08rem;
  min-height: 120px;
  max-height: 70vh;
  overflow-y: auto;
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, width, children }) => {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <ModalBox width={width} onClick={e => e.stopPropagation()}>
        {title && (
          <ModalHeader>
            <span>{title}</span>
            <CloseBtn onClick={onClose} aria-label="닫기">×</CloseBtn>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalBox>
    </Overlay>
  );
};

export default Modal; 