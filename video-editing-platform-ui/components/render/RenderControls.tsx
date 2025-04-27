'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { Button } from '../ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';

export function RenderControls() {
  const { uploadedVideo } = useSelector((state: RootState) => state.video);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);

  const handleRender = () => {
    if (!uploadedVideo.url) return;

    setIsRendering(true);
    setRenderProgress(0);
    setRenderComplete(false);

    // Simulate rendering process
    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        const newProgress = prev + Math.random() * 5;

        if (newProgress >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setRenderComplete(true);
          toast({
            title: "Rendering complete!",
            description: "Your video is ready to download.",
          });
          return 100;
        }

        return newProgress;
      });
    }, 300);
  };

  const handleDownload = () => {
    if (!uploadedVideo.url || !renderComplete) return;

    // In a real app, this would download the rendered video
    // For this mock, we'll just download the original video
    const a = document.createElement('a');
    a.href = uploadedVideo.url;
    a.download = `edited_${uploadedVideo.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast(
      "Download started"
      
    );
  };

  return (
    <div className="w-full bg-neutral-100 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Render & Export</h3>

      {uploadedVideo.url ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRender}
              disabled={isRendering}
              className="flex-1"
            >
              {isRendering ? 'Rendering...' : 'Render Video'}
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!renderComplete}
              variant="outline"
              className="flex-1"
            >
              Download
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Render Progress</p>
            <Progress value={renderProgress} className="h-2" />
            <p className="text-xs text-right mt-1">{Math.round(renderProgress)}%</p>
          </div>

          <div className="bg-white p-3 rounded-md border border-neutral-200">
            <h4 className="font-medium mb-2">Render Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Format:</span> MP4
              </div>
              <div>
                <span className="font-medium">Resolution:</span> 1920x1080
              </div>
              <div>
                <span className="font-medium">Framerate:</span> 30fps
              </div>
              <div>
                <span className="font-medium">Quality:</span> High
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          Upload a video to enable rendering
        </div>
      )}

      {/* Toaster is now added at the app level */}
    </div>
  );
}
