import React, { useState } from 'react';
import styled from 'styled-components';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

const AccordionContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const AccordionHeader = styled.div<{ $expanded: boolean }>`
  padding: 20px 24px;
  background: ${({ $expanded }) => $expanded ? '#f8f9fa' : '#ffffff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  border-bottom: ${({ $expanded }) => $expanded ? '1px solid #e0e0e0' : 'none'};
  
  &:hover {
    background: ${({ $expanded }) => $expanded ? '#f1f3f4' : '#f8f9fa'};
  }
`;

const AccordionTitle = styled.h3`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111111;
  margin: 0;
`;

const AccordionIcon = styled.span<{ $expanded: boolean }>`
  font-size: 20px;
  color: #888888;
  transition: transform 0.3s ease;
  transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionContent = styled.div<{ $expanded: boolean }>`
  max-height: ${({ $expanded }) => $expanded ? '1000px' : '0'};
  opacity: ${({ $expanded }) => $expanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const AccordionBody = styled.div`
  padding: 24px;
`;

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultExpanded = false,
  onToggle
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <AccordionContainer>
      <AccordionHeader $expanded={expanded} onClick={handleToggle}>
        <AccordionTitle>{title}</AccordionTitle>
        <AccordionIcon $expanded={expanded}>▼</AccordionIcon>
      </AccordionHeader>
      <AccordionContent $expanded={expanded}>
        <AccordionBody>
          {children}
        </AccordionBody>
      </AccordionContent>
    </AccordionContainer>
  );
};

export default AccordionItem; 