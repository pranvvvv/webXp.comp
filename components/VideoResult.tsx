/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {ArrowPathIcon, PlusIcon, SparklesIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
}) => {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-10 p-4 md:p-10 glass-panel rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Visual Identity Generated
        </h2>
        <p className="text-gray-500 text-sm font-medium tracking-widest uppercase">Motion Masterpiece Complete</p>
      </div>

      <div className="w-full relative group rounded-2xl overflow-hidden shadow-2xl bg-black/40 ring-1 ring-white/10">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain aspect-video"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl border border-white/5 transition-all active:scale-95">
          <ArrowPathIcon className="w-5 h-5" />
          Regenerate
        </button>
        {canExtend && (
          <button
            onClick={onExtend}
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            <SparklesIcon className="w-5 h-5" />
            Add Scenes
          </button>
        )}
        <button
          onClick={onNewVideo}
          className="flex items-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl transition-all active:scale-95">
          <PlusIcon className="w-5 h-5" />
          Create New
        </button>
      </div>
    </div>
  );
};

export default VideoResult;