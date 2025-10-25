import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';

interface SortableOptionProps {
  id: string;
  value: string;
  index: number;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SortableOption({ id, value, index, onUpdate, onRemove, canRemove }: SortableOptionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-card border border-border rounded-md p-2"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex-1">
        <Input
          placeholder={`Option ${index + 1}`}
          value={value}
          onChange={(e) => onUpdate(e.target.value)}
          required
        />
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


