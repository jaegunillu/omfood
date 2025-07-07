import React, { useState } from 'react';

interface DragDropItem {
  id: string;
  [key: string]: any;
}

interface DragDropListProps {
  items: DragDropItem[];
  onReorder: (items: DragDropItem[]) => void;
  renderItem: (item: DragDropItem, index: number) => React.ReactNode;
  className?: string;
}

const DragDropList: React.FC<DragDropListProps> = ({
  items,
  onReorder,
  renderItem,
  className = ''
}) => {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DragDropItem) => {
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
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div 
            className={`min-h-1 bg-transparent rounded transition-all duration-200 ${
              dragOverIndex === index && draggedItem?.id !== item.id 
                ? 'bg-orange-400' 
                : 'bg-transparent'
            }`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          />
          <div
            draggable
            className={`relative bg-white border-2 rounded-xl p-4 cursor-grab transition-all duration-300 ${
              draggedItem?.id === item.id
                ? 'border-orange-500 rotate-1 scale-105 shadow-xl z-50'
                : dragOverIndex === index && draggedItem?.id !== item.id
                ? 'border-gray-300'
                : 'border-gray-100 hover:border-orange-300 hover:shadow-lg'
            }`}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors">
              ⋮⋮
            </div>
            {renderItem(item, index)}
          </div>
        </React.Fragment>
      ))}
      <div 
        className={`min-h-1 bg-transparent rounded transition-all duration-200 ${
          dragOverIndex === items.length ? 'bg-orange-400' : 'bg-transparent'
        }`}
        onDragOver={(e) => handleDragOver(e, items.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, items.length)}
      />
    </div>
  );
};

export default DragDropList; 