import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

// Define an interface for the widget items
interface Widget {
  id: string;
  name: string;
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
    const mappedData: Widget[] = data.map(
      (item, index) => item || { id: `placeholder-${index}`, name: '' },
    );
    setWidgets(mappedData);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const draggableElements = [
        ...document.querySelectorAll('.widget:not(.dragging)'),
      ];
      const closest = calculateClosestWidget(
        draggableElements,
        e.clientX,
        e.clientY,
      );
      if (closest) {
        setHoveredWidgetId(closest.getAttribute('data-widget-id') || null);
      } else {
        setHoveredWidgetId(null);
      }
    },
    [widgets],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const targetId = hoveredWidgetId;

      if (draggedId && targetId) {
        const newWidgets = [...widgets];
        const draggedIndex = newWidgets.findIndex((w) => w.id === draggedId);
        const targetIndex = newWidgets.findIndex((w) => w.id === targetId);

        if (
          draggedIndex >= 0 &&
          targetIndex >= 0 &&
          draggedIndex !== targetIndex
        ) {
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

  return { widgets, handleDragStart, handleDragOver, handleDrop, draggedId };
};

const calculateClosestWidget = (
  draggableElements: Element[],
  mouseX: number,
  mouseY: number,
): Element | null => {
  let closest: Element | null = null;
  let closestDistance = Infinity;

  draggableElements.forEach((element) => {
    const box = element.getBoundingClientRect();
    const offsetX = mouseX - (box.left + box.width / 2);
    const offsetY = mouseY - (box.top + box.height / 2);
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);

    if (distance < closestDistance) {
      closest = element;
      closestDistance = distance;
    }
  });

  return closest;
};

function App() {
  const { widgets, handleDragStart, handleDragOver, handleDrop, draggedId } =
    useDragAndDrop();

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
            draggable={!!widget.id && !widget.id.startsWith('placeholder')}
            data-widget-id={widget.id}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`widget ${draggedId === widget.id ? 'dragging' : ''}`}
          >
            {widget.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;
