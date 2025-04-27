'use client';

import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  VideoSegment,
  setSelectedSegment,
  updateSegment,
  removeSegment,
  reorderSegments
} from '@/app/redux/slices/timelineSlice';
import { setCurrentTime } from '@/app/redux/slices/videoSlice';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Button } from '../ui/button';
import { Slider } from '@/components/ui/slider';

export function Timeline() {
  const dispatch = useDispatch();
  const { segments, selectedSegmentId, zoom } = useSelector((state: RootState) => state.timeline);
  const { uploadedVideo, currentTime } = useSelector((state: RootState) => state.video);
  // This state is used by child components through the setIsDragging prop
  const [, setIsDragging] = useState(false);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!uploadedVideo.duration) return;

    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const newTime = percentage * uploadedVideo.duration;

    dispatch(setCurrentTime(newTime));
  };

  const handleSegmentSelect = (segmentId: string) => {
    dispatch(setSelectedSegment(segmentId));
  };

  const handleSegmentDelete = (segmentId: string) => {
    dispatch(removeSegment(segmentId));
  };

  const moveSegment = (dragIndex: number, hoverIndex: number) => {
    const newSegments = [...segments];
    const [movedSegment] = newSegments.splice(dragIndex, 1);
    newSegments.splice(hoverIndex, 0, movedSegment);
    dispatch(reorderSegments(newSegments));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full bg-neutral-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Timeline</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">Zoom:</span>
            <Slider
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(value) => dispatch({ type: 'timeline/setZoom', payload: value[0] })}
              className="w-32"
            />
          </div>
        </div>

        <div
          className="relative h-8 bg-neutral-200 rounded cursor-pointer mb-4"
          onClick={handleTimelineClick}
        >
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 h-full flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-1 border-l border-neutral-300 h-full relative">
                <span className="absolute -top-5 left-0 text-xs text-neutral-500">
                  {Math.round((uploadedVideo.duration / 10) * i)}s
                </span>
              </div>
            ))}
            <div className="border-l border-neutral-300 h-full relative">
              <span className="absolute -top-5 right-0 text-xs text-neutral-500">
                {Math.round(uploadedVideo.duration)}s
              </span>
            </div>
          </div>

          {/* Current time indicator */}
          <div
            className="absolute top-0 h-full w-0.5 bg-primary z-10"
            style={{
              left: `${(currentTime / uploadedVideo.duration) * 100}%`,
              display: uploadedVideo.duration ? 'block' : 'none'
            }}
          />
        </div>

        <div className="space-y-2">
          {segments.map((segment, index) => (
            <TimelineSegment
              key={segment.id}
              segment={segment}
              index={index}
              isSelected={segment.id === selectedSegmentId}
              videoDuration={uploadedVideo.duration}
              onSelect={() => handleSegmentSelect(segment.id)}
              onDelete={() => handleSegmentDelete(segment.id)}
              moveSegment={moveSegment}
              setIsDragging={setIsDragging}
            />
          ))}
        </div>

        {segments.length === 0 && !uploadedVideo.url && (
          <div className="text-center py-8 text-neutral-500">
            Upload a video to start editing
          </div>
        )}
      </div>
    </DndProvider>
  );
}

interface TimelineSegmentProps {
  segment: VideoSegment;
  index: number;
  isSelected: boolean;
  videoDuration: number;
  onSelect: () => void;
  onDelete: () => void;
  moveSegment: (dragIndex: number, hoverIndex: number) => void;
  setIsDragging: (isDragging: boolean) => void;
}

function TimelineSegment({
  segment,
  index,
  isSelected,
  videoDuration,
  onSelect,
  onDelete,
  moveSegment,
  setIsDragging
}: TimelineSegmentProps) {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'SEGMENT',
    item: () => {
      setIsDragging(true);
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      setIsDragging(false);
    },
  });

  const [, drop] = useDrop({
    accept: 'SEGMENT',
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveSegment(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleStartTimeChange = (value: number[]) => {
    dispatch(updateSegment({
      id: segment.id,
      updates: { startTime: value[0] }
    }));
  };

  const handleEndTimeChange = (value: number[]) => {
    dispatch(updateSegment({
      id: segment.id,
      updates: { endTime: value[0] }
    }));
  };

  return (
    <div
      ref={ref}
      className={`relative flex items-center p-2 rounded-md ${
        isSelected ? 'bg-primary/10 border border-primary' : 'bg-white border border-neutral-200'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={onSelect}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="flex-1 mr-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium truncate max-w-[200px]">
            {segment.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span>Start:</span>
          <Slider
            value={[segment.startTime]}
            min={0}
            max={segment.endTime - 0.1}
            step={0.1}
            onValueChange={handleStartTimeChange}
            className="w-24"
            onClick={(e) => e.stopPropagation()}
          />
          <span>{segment.startTime.toFixed(1)}s</span>

          <span className="ml-4">End:</span>
          <Slider
            value={[segment.endTime]}
            min={segment.startTime + 0.1}
            max={videoDuration || 100}
            step={0.1}
            onValueChange={handleEndTimeChange}
            className="w-24"
            onClick={(e) => e.stopPropagation()}
          />
          <span>{segment.endTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

// End of file
