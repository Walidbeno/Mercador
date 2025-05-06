declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;
  export type DragStart = {
    draggableId: DraggableId;
    type: TypeId;
    source: DraggableLocation;
    mode: MovementMode;
  };

  export type DragUpdate = DragStart & {
    destination?: DraggableLocation | null;
    // other properties exist but are not needed for our use case
  };

  export type DropResult = DragUpdate & {
    reason: DropReason;
  };

  export type DraggableLocation = {
    droppableId: DroppableId;
    index: number;
  };

  export type MovementMode = 'FLUID' | 'SNAP';
  export type DropReason = 'DROP' | 'CANCEL';
  export type TypeId = string;

  export type DraggableProvided = {
    innerRef: React.RefCallback<HTMLElement>;
    draggableProps: React.HTMLAttributes<HTMLElement>;
    dragHandleProps?: React.HTMLAttributes<HTMLElement> | null;
  };

  export type DraggableStateSnapshot = {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver?: DroppableId | null;
    dropAnimation?: { duration: number; curve: string } | null;
    // other properties exist but are not needed for our use case
  };

  export type DroppableProvided = {
    innerRef: React.RefCallback<HTMLElement>;
    droppableProps: React.HTMLAttributes<HTMLElement>;
    placeholder?: React.ReactElement | null;
  };

  export type DroppableStateSnapshot = {
    isDraggingOver: boolean;
    draggingOverWith?: DraggableId | null;
    // other properties exist but are not needed for our use case
  };

  export type DragDropContextProps = {
    onDragStart?(initial: DragStart): void;
    onDragUpdate?(initial: DragUpdate): void;
    onDragEnd(result: DropResult): void;
    children: React.ReactNode;
  };

  export type DraggableChildrenFn = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => React.ReactElement<HTMLElement>;

  export type DroppableChildrenFn = (
    provided: DroppableProvided,
    snapshot: DroppableStateSnapshot
  ) => React.ReactElement<HTMLElement>;

  export type DraggableProps = {
    draggableId: DraggableId;
    index: number;
    children: DraggableChildrenFn;
    isDragDisabled?: boolean;
    // other properties exist but are not needed for our use case
  };

  export type DroppableProps = {
    droppableId: DroppableId;
    children: DroppableChildrenFn;
    type?: TypeId;
    isDropDisabled?: boolean;
    // other properties exist but are not needed for our use case
  };

  export const DragDropContext: React.ComponentClass<DragDropContextProps>;
  export const Droppable: React.ComponentClass<DroppableProps>;
  export const Draggable: React.ComponentClass<DraggableProps>;
} 