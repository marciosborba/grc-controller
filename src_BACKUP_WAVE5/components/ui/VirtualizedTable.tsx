import React, { useMemo } from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody } from '@/components/ui/table';

interface VirtualizedTableProps {
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  headers: string[];
  maxHeight?: number;
  itemHeight?: number;
}

const VirtualizedTable = React.memo(({ 
  data, 
  renderRow, 
  headers, 
  maxHeight = 600, 
  itemHeight = 60 
}: VirtualizedTableProps) => {
  // Simple virtualization: only render items that would be visible
  const [startIndex, setStartIndex] = React.useState(0);
  const [endIndex, setEndIndex] = React.useState(Math.min(10, data.length)); // Start with 10 items
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate visible range based on scroll position
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight;
    
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const newEndIndex = Math.min(newStartIndex + visibleCount + 2, data.length); // +2 for buffer
    
    if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
      setStartIndex(Math.max(0, newStartIndex - 1)); // -1 for buffer
      setEndIndex(newEndIndex);
    }
  }, [startIndex, endIndex, itemHeight, data.length]);

  // Update visible range when data changes
  React.useEffect(() => {
    setStartIndex(0);
    setEndIndex(Math.min(10, data.length));
  }, [data.length]);

  const visibleData = useMemo(() => 
    data.slice(startIndex, endIndex), 
    [data, startIndex, endIndex]
  );

  // If data is small, render normally
  if (data.length <= 20) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="text-xs">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => renderRow(item, index))}
        </TableBody>
      </Table>
    );
  }

  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ maxHeight }}
      onScroll={handleScroll}
    >
      <Table>
        <TableHeader style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }}>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="text-xs">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            height: totalHeight
          }}
        >
          {visibleData.map((item, index) => renderRow(item, startIndex + index))}
        </TableBody>
      </Table>
      
      {/* Empty space to maintain scroll height */}
      {totalHeight > maxHeight && (
        <div style={{ height: Math.max(0, totalHeight - (endIndex * itemHeight)) }} />
      )}
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;