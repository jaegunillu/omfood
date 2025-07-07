import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  onToggle,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div 
        className={`px-6 py-4 cursor-pointer flex items-center justify-between transition-all duration-300 ${
          expanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'
        }`}
        onClick={handleToggle}
      >
        <h3 className="text-lg font-semibold text-gray-900 font-pretendard">
          {title}
        </h3>
        <span 
          className={`text-gray-500 transition-transform duration-300 ${
            expanded ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion; 