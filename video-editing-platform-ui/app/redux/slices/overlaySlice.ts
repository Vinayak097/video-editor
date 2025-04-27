import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ImageOverlay {
  id: string;
  file: File | null;
  url: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  opacity: number;
  startTime: number;
  endTime: number;
  border: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted' | 'none';
  };
}

export interface TextOverlay {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  font: string;
  fontSize: number;
  color: string;
  startTime: number;
  endTime: number;
}

export interface OverlayState {
  images: ImageOverlay[];
  texts: TextOverlay[];
  selectedOverlayId: string | null;
  selectedOverlayType: 'image' | 'text' | null;
}

const initialState: OverlayState = {
  images: [],
  texts: [],
  selectedOverlayId: null,
  selectedOverlayType: null,
};

export const overlaySlice = createSlice({
  name: 'overlay',
  initialState,
  reducers: {
    addImageOverlay: (state, action: PayloadAction<ImageOverlay>) => {
      state.images.push(action.payload);
    },
    updateImageOverlay: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<ImageOverlay> }>
    ) => {
      const { id, updates } = action.payload;
      const overlayIndex = state.images.findIndex((overlay) => overlay.id === id);
      if (overlayIndex !== -1) {
        state.images[overlayIndex] = {
          ...state.images[overlayIndex],
          ...updates,
        };
      }
    },
    removeImageOverlay: (state, action: PayloadAction<string>) => {
      const overlayIndex = state.images.findIndex((overlay) => overlay.id === action.payload);
      if (overlayIndex !== -1) {
        // Clean up URL
        URL.revokeObjectURL(state.images[overlayIndex].url);
        state.images = state.images.filter((overlay) => overlay.id !== action.payload);
      }
      if (state.selectedOverlayId === action.payload && state.selectedOverlayType === 'image') {
        state.selectedOverlayId = null;
        state.selectedOverlayType = null;
      }
    },
    addTextOverlay: (state, action: PayloadAction<TextOverlay>) => {
      state.texts.push(action.payload);
    },
    updateTextOverlay: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<TextOverlay> }>
    ) => {
      const { id, updates } = action.payload;
      const overlayIndex = state.texts.findIndex((overlay) => overlay.id === id);
      if (overlayIndex !== -1) {
        state.texts[overlayIndex] = {
          ...state.texts[overlayIndex],
          ...updates,
        };
      }
    },
    removeTextOverlay: (state, action: PayloadAction<string>) => {
      state.texts = state.texts.filter((overlay) => overlay.id !== action.payload);
      if (state.selectedOverlayId === action.payload && state.selectedOverlayType === 'text') {
        state.selectedOverlayId = null;
        state.selectedOverlayType = null;
      }
    },
    setSelectedOverlay: (
      state,
      action: PayloadAction<{ id: string; type: 'image' | 'text' } | null>
    ) => {
      if (action.payload === null) {
        state.selectedOverlayId = null;
        state.selectedOverlayType = null;
      } else {
        state.selectedOverlayId = action.payload.id;
        state.selectedOverlayType = action.payload.type;
      }
    },
    resetOverlays: (state) => {
      // Clean up URLs
      state.images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      return initialState;
    },
  },
});

export const {
  addImageOverlay,
  updateImageOverlay,
  removeImageOverlay,
  addTextOverlay,
  updateTextOverlay,
  removeTextOverlay,
  setSelectedOverlay,
  resetOverlays,
} = overlaySlice.actions;

export default overlaySlice.reducer;
