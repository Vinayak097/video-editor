import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
}

export interface TimelineState {
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  zoom: number;
}

const initialState: TimelineState = {
  segments: [],
  selectedSegmentId: null,
  zoom: 1,
};

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    addSegment: (state, action: PayloadAction<VideoSegment>) => {
      state.segments.push(action.payload);
    },
    updateSegment: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<VideoSegment> }>
    ) => {
      const { id, updates } = action.payload;
      const segmentIndex = state.segments.findIndex((segment) => segment.id === id);
      if (segmentIndex !== -1) {
        state.segments[segmentIndex] = {
          ...state.segments[segmentIndex],
          ...updates,
        };
      }
    },
    removeSegment: (state, action: PayloadAction<string>) => {
      state.segments = state.segments.filter((segment) => segment.id !== action.payload);
      if (state.selectedSegmentId === action.payload) {
        state.selectedSegmentId = null;
      }
    },
    reorderSegments: (state, action: PayloadAction<VideoSegment[]>) => {
      state.segments = action.payload;
    },
    setSelectedSegment: (state, action: PayloadAction<string | null>) => {
      state.selectedSegmentId = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    resetTimeline: () => initialState,
  },
});

export const {
  addSegment,
  updateSegment,
  removeSegment,
  reorderSegments,
  setSelectedSegment,
  setZoom,
  resetTimeline,
} = timelineSlice.actions;

export default timelineSlice.reducer;
