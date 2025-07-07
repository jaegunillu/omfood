import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface SortableItem {
  id: string;
  [key: string]: any;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  renderItem: (item: SortableItem, index: number) => React.ReactNode;
  className?: string;
}

const dragAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.div<{ $isDragging: boolean; $isDragOver: boolean }>`
  position: relative;
  background: #ffffff;
  border: 2px solid ${({ $isDragging, $isDragOver }) => 
    $isDragging ? '#F88D2A' : $isDragOver ? '#e0e0e0' : '#f0f0f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: ${({ $isDragging }) => $isDragging ? 'grabbing' : 'grab'};
  transition: all 0.3s ease;
  transform: ${({ $isDragging }) => $isDragging ? 'rotate(2deg) scale(1.02)' : 'none'};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)'};
  z-index: ${({ $isDragging }) => $isDragging ? 1000 : 1};
  
  &:hover {
    border-color: #F88D2A;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  ${({ $isDragging }) => $isDragging && `
    animation: ${dragAnimation} 0.3s ease;
  `}
`;

const DragHandle = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888888;
  font-size: 16px;
  cursor: grab;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #F88D2A;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const DropZone = styled.div<{ $isDragOver: boolean }>`
  min-height: 4px;
  background: ${({ $isDragOver }) => $isDragOver ? '#F88D2A' : 'transparent'};
  border-radius: 2px;
  transition: all 0.2s ease;
  margin: 4px 0;
`;

const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  renderItem,
  className
}) => {
  const [draggedItem, setDraggedItem] = useState<SortableItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: SortableItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    
    onReorder(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <ListContainer className={className}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <DropZone 
            $isDragOver={dragOverIndex === index && draggedItem?.id !== item.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          />
          <ListItem
            draggable
            $isDragging={draggedItem?.id === item.id}
            $isDragOver={dragOverIndex === index && draggedItem?.id !== item.id}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <DragHandle>⋮⋮</DragHandle>
            {renderItem(item, index)}
          </ListItem>
        </React.Fragment>
      ))}
      <DropZone 
        $isDragOver={dragOverIndex === items.length}
        onDragOver={(e) => handleDragOver(e, items.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, items.length)}
      />
    </ListContainer>
  );
};

export default SortableList; 