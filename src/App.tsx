import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

// Define an interface for the widget items
interface Widget {
  id: string;
  name: string;
  draggable?: boolean | undefined;
}

// Define initial data including potential nulls which are handled later
const data: (Widget | null)[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
  { id: '4', name: 'Item 4' },
  { id: '5', name: 'Item 5' },
  null,
  null,
  null,
  null,
  null,
  { id: '6', name: 'Item 6' },
  { id: '7', name: 'Item 7' },
];

// Custom hook for drag-and-drop logic
const useDragAndDrop = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  useEffect(() => {
    const mappedData: Widget[] = data.map((item, index) =>
      item == null
        ? { id: `placeholder-${index}`, name: '' }
        : { ...item, draggable: true },
    );
    setWidgets(mappedData);
  }, []);

  const handleDragStart = useCallback((e: any, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (draggedId && hoveredWidgetId) {
        const newWidgets = [...widgets];
        const draggedIndex = newWidgets.findIndex((w) => w.id === draggedId);
        const targetIndex = newWidgets.findIndex(
          (w) => w.id === hoveredWidgetId,
        );

        if (draggedIndex !== targetIndex) {
          [newWidgets[draggedIndex], newWidgets[targetIndex]] = [
            newWidgets[targetIndex],
            newWidgets[draggedIndex],
          ];
          setWidgets(newWidgets);
        }
      }
      setDraggedId(null);
      setHoveredWidgetId(null);
    },
    [widgets, draggedId, hoveredWidgetId],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      const target = e.target as HTMLElement;
      const newHoveredId = target.getAttribute('data-widget-id');
      if (newHoveredId && newHoveredId !== hoveredWidgetId) {
        setHoveredWidgetId(newHoveredId);
      }
    },
    [hoveredWidgetId],
  );

  return {
    widgets,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnter,
    draggedId,
    hoveredWidgetId,
  };
};

function App() {
  const {
    widgets,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnter,
    draggedId,
    hoveredWidgetId,
  } = useDragAndDrop();

  return (
    <div className="container">
      <div
        className="drag-and-drop"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.ceil(widgets.length / 3)}, 1fr)`,
        }}
      >
        {widgets.map((widget) => (
          <motion.div
            layout
            key={widget.id}
            draggable={widget.draggable}
            data-widget-id={widget.id}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            className={`widget 
            ${draggedId === widget.id ? 'dragging' : ''}
            ${hoveredWidgetId === widget.id ? 'hovered' : ''}
            `}
          >
            {widget.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;
