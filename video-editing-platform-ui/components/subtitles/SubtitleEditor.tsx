'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  Subtitle,
  addSubtitle,
  updateSubtitle,
  removeSubtitle,
  setSelectedSubtitle
} from '@/app/redux/slices/subtitleSlice';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { generateId } from '@/lib/utils/id';

export function SubtitleEditor() {
  const dispatch = useDispatch();
  const { subtitles, selectedSubtitleId } = useSelector((state: RootState) => state.subtitle);
  const { uploadedVideo, currentTime } = useSelector((state: RootState) => state.video);
  const [newSubtitleText, setNewSubtitleText] = useState('');

  const selectedSubtitle = subtitles.find(subtitle => subtitle.id === selectedSubtitleId);

  const handleAddSubtitle = () => {
    if (!newSubtitleText.trim() || !uploadedVideo.url) return;

    const newSubtitle: Subtitle = {
      id: generateId(),
      text: newSubtitleText,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, uploadedVideo.duration),
      font: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      position: {
        x: 50, // center
        y: 10  // bottom
      }
    };

    dispatch(addSubtitle(newSubtitle));
    dispatch(setSelectedSubtitle(newSubtitle.id));
    setNewSubtitleText('');
  };

  const handleSubtitleSelect = (subtitleId: string) => {
    dispatch(setSelectedSubtitle(subtitleId));
  };

  const handleSubtitleDelete = (subtitleId: string) => {
    dispatch(removeSubtitle(subtitleId));
  };

  const handleTextChange = (text: string) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { text }
    }));
  };

  const handleStartTimeChange = (startTime: number[]) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { startTime: startTime[0] }
    }));
  };

  const handleEndTimeChange = (endTime: number[]) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { endTime: endTime[0] }
    }));
  };

  const handleFontSizeChange = (fontSize: number[]) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { fontSize: fontSize[0] }
    }));
  };

  const handleColorChange = (color: string) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { color }
    }));
  };

  const handlePositionXChange = (x: number[]) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { position: { ...selectedSubtitle!.position, x: x[0] } }
    }));
  };

  const handlePositionYChange = (y: number[]) => {
    if (!selectedSubtitleId) return;
    dispatch(updateSubtitle({
      id: selectedSubtitleId,
      updates: { position: { ...selectedSubtitle!.position, y: y[0] } }
    }));
  };

  return (
    <div className="w-full bg-neutral-100 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Subtitles</h3>
      
      {uploadedVideo.url ? (
        <>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter subtitle text..."
              value={newSubtitleText}
              onChange={(e) => setNewSubtitleText(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddSubtitle}>Add</Button>
          </div>
          
          <div className="space-y-2 mb-4">
            {subtitles.map((subtitle) => (
              <div
                key={subtitle.id}
                className={`p-2 rounded-md cursor-pointer ${
                  subtitle.id === selectedSubtitleId
                    ? 'bg-primary/10 border border-primary'
                    : 'bg-white border border-neutral-200'
                }`}
                onClick={() => handleSubtitleSelect(subtitle.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {subtitle.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubtitleDelete(subtitle.id);
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
                  {subtitle.startTime.toFixed(1)}s - {subtitle.endTime.toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
          
          {selectedSubtitle && (
            <div className="bg-white p-3 rounded-md border border-neutral-200">
              <h4 className="font-medium mb-3">Edit Subtitle</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Text</label>
                  <Input
                    value={selectedSubtitle.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedSubtitle.startTime]}
                      min={0}
                      max={selectedSubtitle.endTime - 0.1}
                      step={0.1}
                      onValueChange={handleStartTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedSubtitle.startTime.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedSubtitle.endTime]}
                      min={selectedSubtitle.startTime + 0.1}
                      max={uploadedVideo.duration || 100}
                      step={0.1}
                      onValueChange={handleEndTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedSubtitle.endTime.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Font Size</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedSubtitle.fontSize]}
                      min={12}
                      max={48}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedSubtitle.fontSize}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedSubtitle.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm">{selectedSubtitle.color}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Position X</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedSubtitle.position.x]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionXChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedSubtitle.position.x}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Position Y</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedSubtitle.position.y]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionYChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedSubtitle.position.y}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          Upload a video to add subtitles
        </div>
      )}
    </div>
  );
}
