'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VideoUpload } from '../upload/VideoUpload';
import { VideoPreview } from '../preview/VideoPreview';
import { Timeline } from '../timeline/Timeline';
import { AudioManager } from '../audio/AudioManager';
import { SubtitleEditor } from '../subtitles/SubtitleEditor';
import { ImageOverlayEditor } from '../overlay/ImageOverlayEditor';
import { TextOverlayEditor } from '../overlay/TextOverlayEditor';
import { RenderControls } from '../render/RenderControls';

export function EditorLayout() {
  const { uploadedVideo } = useSelector((state: RootState) => state.video);
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Video Editing Platform</h1>

      {!uploadedVideo.url ? (
        <VideoUpload />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPreview />
            <Timeline />
          </div>

          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="mt-4">
                <AudioManager />
              </TabsContent>

              <TabsContent value="subtitles" className="mt-4">
                <SubtitleEditor />
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                <ImageOverlayEditor />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <TextOverlayEditor />
              </TabsContent>
            </Tabs>

            <RenderControls />
          </div>
        </div>
      )}
    </div>
  );
}
