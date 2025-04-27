'use client';

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { RootState } from '@/app/redux/store';
import {
  ImageOverlay,
  addImageOverlay,
  updateImageOverlay,
  removeImageOverlay,
  setSelectedOverlay
} from '@/app/redux/slices/overlaySlice';

import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateId } from '@/lib/utils/id';
import { Button } from '../ui/button';

export function ImageOverlayEditor() {
  const dispatch = useDispatch();
  const { images, selectedOverlayId, selectedOverlayType } = useSelector((state: RootState) => state.overlay);
  const { uploadedVideo, currentTime } = useSelector((state: RootState) => state.video);

  const selectedImage = selectedOverlayType === 'image' && selectedOverlayId
    ? images.find(image => image.id === selectedOverlayId)
    : null;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const imageId = generateId();
    const imageOverlay: ImageOverlay = {
      id: imageId,
      file,
      url: URL.createObjectURL(file),
      position: {
        x: 50, // center
        y: 50  // center
      },
      size: {
        width: 200,
        height: 200
      },
      opacity: 1,
      startTime: currentTime,
      endTime: uploadedVideo.duration || 100,
      border: {
        width: 0,
        color: '#000000',
        style: 'solid'
      }
    };
    
    dispatch(addImageOverlay(imageOverlay));
    dispatch(setSelectedOverlay({ id: imageId, type: 'image' }));
  }, [dispatch, currentTime, uploadedVideo.duration]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  });

  const handleImageSelect = (imageId: string) => {
    dispatch(setSelectedOverlay({ id: imageId, type: 'image' }));
  };

  const handleImageDelete = (imageId: string) => {
    dispatch(removeImageOverlay(imageId));
  };

  const handlePositionXChange = (x: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { position: { ...selectedImage.position, x: x[0] } }
    }));
  };

  const handlePositionYChange = (y: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { position: { ...selectedImage.position, y: y[0] } }
    }));
  };

  const handleWidthChange = (width: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { size: { ...selectedImage.size, width: width[0] } }
    }));
  };

  const handleHeightChange = (height: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { size: { ...selectedImage.size, height: height[0] } }
    }));
  };

  const handleOpacityChange = (opacity: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { opacity: opacity[0] }
    }));
  };

  const handleStartTimeChange = (startTime: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { startTime: startTime[0] }
    }));
  };

  const handleEndTimeChange = (endTime: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { endTime: endTime[0] }
    }));
  };

  const handleBorderWidthChange = (width: number[]) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { border: { ...selectedImage.border, width: width[0] } }
    }));
  };

  const handleBorderColorChange = (color: string) => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { border: { ...selectedImage.border, color } }
    }));
  };

  const handleBorderStyleChange = (style: 'solid' | 'dashed' | 'dotted' | 'none') => {
    if (!selectedImage) return;
    dispatch(updateImageOverlay({
      id: selectedImage.id,
      updates: { border: { ...selectedImage.border, style } }
    }));
  };

  return (
    <div className="w-full bg-neutral-100 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Image Overlays</h3>
      
      {uploadedVideo.url ? (
        <>
          <div className="mb-4">
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary">
              <input {...getInputProps()} />
              <p className="text-sm">Drag & drop an image here, or click to select</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer ${
                  image.id === selectedOverlayId && selectedOverlayType === 'image'
                    ? 'ring-2 ring-primary'
                    : ''
                }`}
                onClick={() => handleImageSelect(image.id)}
              >
                <img
                  src={image.url}
                  alt="Overlay"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDelete(image.id);
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
          
          {selectedImage && (
            <div className="bg-white p-3 rounded-md border border-neutral-200">
              <h4 className="font-medium mb-3">Edit Image Overlay</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Position X</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.position.x]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionXChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.position.x}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Position Y</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.position.y]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handlePositionYChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.position.y}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Width</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.size.width]}
                      min={50}
                      max={500}
                      step={10}
                      onValueChange={handleWidthChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.size.width}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Height</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.size.height]}
                      min={50}
                      max={500}
                      step={10}
                      onValueChange={handleHeightChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.size.height}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Opacity</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.opacity]}
                      min={0.1}
                      max={1}
                      step={0.05}
                      onValueChange={handleOpacityChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{Math.round(selectedImage.opacity * 100)}%</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.startTime]}
                      min={0}
                      max={selectedImage.endTime - 0.1}
                      step={0.1}
                      onValueChange={handleStartTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.startTime.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.endTime]}
                      min={selectedImage.startTime + 0.1}
                      max={uploadedVideo.duration || 100}
                      step={0.1}
                      onValueChange={handleEndTimeChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.endTime.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Border Width</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedImage.border.width]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={handleBorderWidthChange}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedImage.border.width}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Border Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedImage.border.color}
                      onChange={(e) => handleBorderColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm">{selectedImage.border.color}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Border Style</label>
                  <Select
                    value={selectedImage.border.style}
                    onValueChange={(value: any) => handleBorderStyleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          Upload a video to add image overlays
        </div>
      )}
    </div>
  );
}
