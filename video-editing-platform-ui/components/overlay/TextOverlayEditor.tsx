'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  TextOverlay,
  addTextOverlay,
  updateTextOverlay,
  removeTextOverlay,
  setSelectedOverlay
} from '@/app/redux/slices/overlaySlice';

import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { generateId } from '@/lib/utils/id';
import { Button } from '../ui/button';

export function TextOverlayEditor() {
  const dispatch = useDispatch();
  const { texts, selectedOverlayId, selectedOverlayType } = useSelector((state: RootState) => state.overlay);
  const { uploadedVideo, currentTime } = useSelector((state: RootState) => state.video);
  const [newText, setNewText] = useState('');

  const selectedText = selectedOverlayType === 'text' && selectedOverlayId
    ? texts.find(text => text.id === selectedOverlayId)
    : null;

  const handleAddText = () => {
    if (!newText.trim() || !uploadedVideo.url) return;

    const textId = generateId();
    const textOverlay: TextOverlay = {
      id: textId,
      text: newText,
      position: {
        x: 50, // center
        y: 50  // center
      },
      font: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, uploadedVideo.duration || 100)
    };
    
    dispatch(addTextOverlay(textOverlay));
    dispatch(setSelectedOverlay({ id: textId, type: 'text' }));
    setNewText('');
  };

  const handleTextSelect = (textId: string) => {
    dispatch(setSelectedOverlay({ id: textId, type: 'text' }));
  };

  const handleTextDelete = (textId: string) => {
    dispatch(removeTextOverlay(textId));
  };

  const handleTextChange = (text: string) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { text }
    }));
  };

  const handlePositionXChange = (x: number[]) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { position: { ...selectedText.position, x: x[0] } }
    }));
  };

  const handlePositionYChange = (y: number[]) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { position: { ...selectedText.position, y: y[0] } }
    }));
  };

  const handleFontSizeChange = (fontSize: number[]) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { fontSize: fontSize[0] }
    }));
  };

  const handleColorChange = (color: string) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { color }
    }));
  };

  const handleStartTimeChange = (startTime: number[]) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { startTime: startTime[0] }
    }));
  };

  const handleEndTimeChange = (endTime: number[]) => {
    if (!selectedText) return;
    dispatch(updateTextOverlay({
      id: selectedText.id,
      updates: { endTime: endTime[0] }
    }));
  };

  return (
    <div className="w-full bg-neutral-100 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Text Overlays</h3>
      
      {uploadedVideo.url ? (
        <>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter text..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddText}>Add</Button>
          </div>
          
          <div className="space-y-2 mb-4">
            {texts.map((text) => (
              <div
                key={text.id}
                className={`p-2 rounded-md cursor-pointer ${
                  text.id === selectedOverlayId && selectedOverlayType === 'text'
                    ? 'bg-primary/10 border border-primary'
                    : 'bg-white border border-neutral-200'
                }`}
                onClick={() => handleTextSelect(text.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {text.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTextDelete(text.id);
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
                <div className="text-xs text-neutral-500">
                  {text.startTime.toFixed(1)}s - {text.endTime.toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
          
          {selectedText && (
            <div className="bg-white p-3 rounded-md border border-neutral-200">
              <h4 className="font-medium mb-3">Edit Text Overlay</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Text</label>
                  <Input
                    value={selectedText.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Position X</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedText.position.x]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionXChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedText.position.x}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Position Y</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedText.position.y]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionYChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedText.position.y}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Font Size</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedText.fontSize]}
                      min={12}
                      max={72}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedText.fontSize}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm">{selectedText.color}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedText.startTime]}
                      min={0}
                      max={selectedText.endTime - 0.1}
                      step={0.1}
                      onValueChange={handleStartTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedText.startTime.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedText.endTime]}
                      min={selectedText.startTime + 0.1}
                      max={uploadedVideo.duration || 100}
                      step={0.1}
                      onValueChange={handleEndTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedText.endTime.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          Upload a video to add text overlays
        </div>
      )}
    </div>
  );
}
