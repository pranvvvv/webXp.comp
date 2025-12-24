/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  GenerateVideoParams,
  GenerationMode,
  ImageFile,
  Resolution,
  VeoModel,
  VideoFile,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FilmIcon,
  FramesModeIcon,
  PlusIcon,
  RectangleStackIcon,
  ReferencesModeIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TextModeIcon,
  TvIcon,
  XMarkIcon,
  BriefcaseIcon,
  UtensilsIcon,
  DumbbellIcon,
  StethoscopeIcon,
  GraduationCapIcon,
  ShoppingBagIcon,
  UserIcon
} from './icons';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
  [AspectRatio.LANDSCAPE]: 'Landscape (16:9)',
  [AspectRatio.PORTRAIT]: 'Portrait (9:16)',
};

const modeIcons: Record<GenerationMode, React.ReactNode> = {
  [GenerationMode.TEXT_TO_VIDEO]: <TextModeIcon className="w-5 h-5" />,
  [GenerationMode.FRAMES_TO_VIDEO]: <FramesModeIcon className="w-5 h-5" />,
  [GenerationMode.REFERENCES_TO_VIDEO]: (
    <ReferencesModeIcon className="w-5 h-5" />
  ),
  [GenerationMode.EXTEND_VIDEO]: <FilmIcon className="w-5 h-5" />,
};

const servicePresets = [
  { id: 'web', label: 'Web Dev', icon: <BriefcaseIcon className="w-3.5 h-3.5" />, prompt: "A high-end cinematic 3D motion graphics video showing professional web development. Lines of code glowing in neon blue stream across the screen. Abstract glass server racks rotate while a sleek website dashboard interface emerges. Professional lighting, 8k, modern agency aesthetic." },
  { id: 'mtech', label: 'MTech Help', icon: <GraduationCapIcon className="w-3.5 h-3.5" />, prompt: "Academic motion graphics for UK/USA MTech students. Floating complex mathematical equations and glowing circuit patterns. A 3D laptop icon pulses as a graduation cap appears in a swirl of digital particles. Clean, sophisticated, professional blue and white color scheme." },
  { id: 'restaurant', label: 'Restaurant', icon: <UtensilsIcon className="w-3.5 h-3.5" />, prompt: "Elegant motion graphics for a high-end restaurant. Gourmet food close-ups with stylized typography appearing over steam. Golden bokeh transitions, 3D cutlery silhouettes, and a 'Book Now' interface appearing with smooth animations. Warm, inviting, professional cinematography." },
  { id: 'gym', label: 'Gym/Fitness', icon: <DumbbellIcon className="w-3.5 h-3.5" />, prompt: "High-intensity motion graphics for a gym. Bold, aggressive typography pulsing to a beat. Dark aesthetic with neon blue highlights. 3D weights and fitness tracking UI elements flying through a smoke-filled digital gym environment. Professional sports edit style." },
  { id: 'medical', label: 'Medical/Doc', icon: <StethoscopeIcon className="w-3.5 h-3.5" />, prompt: "Professional medical practice motion graphics. Clean blue and white medical icons floating in a serene 3D space. Smooth transitions showing a modern clinic interface. DNA helix abstract patterns, trust-building aesthetic, high-quality medical visualization." },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingBagIcon className="w-3.5 h-3.5" />, prompt: "Fast-paced e-commerce product showcase. Floating 3D shopping bags and 'Add to Cart' buttons with bouncy animations. Vibrant UI cards showing varied products. Bright lighting, clean shadows, professional consumer-brand motion style." },
  { id: 'portfolio', label: 'Portfolio', icon: <UserIcon className="w-3.5 h-3.5" />, prompt: "Creative personal portfolio intro. Dynamic floating portraits and skill icons. Fluid liquid motion transitions. Minimalist typography, artistic professional lighting, modern design agency feel." }
];

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);
const fileToVideoFile = (file: File): Promise<VideoFile> =>
  fileToBase64<VideoFile>(file);

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, value, onChange, icon, children, disabled = false}) => (
  <div>
    <label
      className={`text-[10px] uppercase tracking-wider block mb-1.5 font-bold ${
        disabled ? 'text-gray-600' : 'text-gray-500'
      }`}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 appearance-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium">
        {children}
      </select>
      <ChevronDownIcon
        className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-gray-700' : 'text-gray-500'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, image, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  if (image) {
    return (
      <div className="relative w-28 h-20 group rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-28 h-20 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all">
      <PlusIcon className="w-5 h-5" />
      <span className="text-[10px] uppercase font-bold mt-1 tracking-tighter">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

const VideoUpload: React.FC<{
  onSelect: (video: VideoFile) => void;
  onRemove?: () => void;
  video?: VideoFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, video, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const videoFile = await fileToVideoFile(file);
        onSelect(videoFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  if (video) {
    return (
      <div className="relative w-48 h-28 group rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <video
          src={URL.createObjectURL(video.file)}
          muted
          loop
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove video">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-48 h-28 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all text-center">
      <PlusIcon className="w-6 h-6" />
      <span className="text-[10px] uppercase font-bold mt-1 px-2 tracking-tighter">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [model, setModel] = useState<VeoModel>(
    initialValues?.model ?? VeoModel.VEO_FAST,
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE,
  );
  const [resolution, setResolution] = useState<Resolution>(
    initialValues?.resolution ?? Resolution.P720,
  );
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    initialValues?.mode ?? GenerationMode.TEXT_TO_VIDEO,
  );
  const [startFrame, setStartFrame] = useState<ImageFile | null>(
    initialValues?.startFrame ?? null,
  );
  const [endFrame, setEndFrame] = useState<ImageFile | null>(
    initialValues?.endFrame ?? null,
  );
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>(
    initialValues?.referenceImages ?? [],
  );
  const [styleImage, setStyleImage] = useState<ImageFile | null>(
    initialValues?.styleImage ?? null,
  );
  const [inputVideo, setInputVideo] = useState<VideoFile | null>(
    initialValues?.inputVideo ?? null,
  );
  const [inputVideoObject, setInputVideoObject] = useState<Video | null>(
    initialValues?.inputVideoObject ?? null,
  );
  const [isLooping, setIsLooping] = useState(initialValues?.isLooping ?? false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '');
      setModel(initialValues.model ?? VeoModel.VEO_FAST);
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE);
      setResolution(initialValues.resolution ?? Resolution.P720);
      setGenerationMode(initialValues.mode ?? GenerationMode.TEXT_TO_VIDEO);
      setStartFrame(initialValues.startFrame ?? null);
      setEndFrame(initialValues.endFrame ?? null);
      setReferenceImages(initialValues.referenceImages ?? []);
      setStyleImage(initialValues.styleImage ?? null);
      setInputVideo(initialValues.inputVideo ?? null);
      setInputVideoObject(initialValues.inputVideoObject ?? null);
      setIsLooping(initialValues.isLooping ?? false);
    }
  }, [initialValues]);

  useEffect(() => {
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      setModel(VeoModel.VEO);
      setAspectRatio(AspectRatio.LANDSCAPE);
      setResolution(Resolution.P720);
    } else if (generationMode === GenerationMode.EXTEND_VIDEO) {
      setResolution(Resolution.P720);
    }
  }, [generationMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modeSelectorRef.current &&
        !modeSelectorRef.current.contains(event.target as Node)
      ) {
        setIsModeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onGenerate({
        prompt,
        model,
        aspectRatio,
        resolution,
        mode: generationMode,
        startFrame,
        endFrame,
        referenceImages,
        styleImage,
        inputVideo,
        inputVideoObject,
        isLooping,
      });
    },
    [
      prompt,
      model,
      aspectRatio,
      resolution,
      generationMode,
      startFrame,
      endFrame,
      referenceImages,
      styleImage,
      inputVideo,
      inputVideoObject,
      onGenerate,
      isLooping,
    ],
  );

  const handleSelectMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setIsModeSelectorOpen(false);
    setStartFrame(null);
    setEndFrame(null);
    setReferenceImages([]);
    setStyleImage(null);
    setInputVideo(null);
    setInputVideoObject(null);
    setIsLooping(false);
  };

  const handleApplyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setGenerationMode(GenerationMode.TEXT_TO_VIDEO);
  };

  const isRefMode = generationMode === GenerationMode.REFERENCES_TO_VIDEO;
  const isExtendMode = generationMode === GenerationMode.EXTEND_VIDEO;

  let isSubmitDisabled = false;
  let tooltipText = '';

  switch (generationMode) {
    case GenerationMode.TEXT_TO_VIDEO:
      isSubmitDisabled = !prompt.trim();
      if (isSubmitDisabled) tooltipText = 'Please enter a prompt.';
      break;
    case GenerationMode.FRAMES_TO_VIDEO:
      isSubmitDisabled = !startFrame;
      if (isSubmitDisabled) tooltipText = 'A start frame is required.';
      break;
    case GenerationMode.REFERENCES_TO_VIDEO:
      const hasNoRefs = referenceImages.length === 0;
      const hasNoPrompt = !prompt.trim();
      isSubmitDisabled = hasNoRefs || hasNoPrompt;
      if (hasNoRefs && hasNoPrompt) tooltipText = 'Add reference images and a prompt.';
      else if (hasNoRefs) tooltipText = 'At least one reference image is required.';
      else if (hasNoPrompt) tooltipText = 'Please enter a prompt.';
      break;
    case GenerationMode.EXTEND_VIDEO:
      isSubmitDisabled = !inputVideoObject;
      if (isSubmitDisabled) tooltipText = 'An input video is required to extend.';
      break;
  }

  return (
    <div className="relative w-full pb-6">
      <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] w-full mb-1 ml-1 text-center md:text-left">Agency Service Presets</span>
         {servicePresets.map((preset) => (
           <button
             key={preset.id}
             onClick={() => handleApplyPreset(preset.prompt)}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition-all active:scale-95">
             {preset.icon}
             {preset.label}
           </button>
         ))}
      </div>

      {isSettingsOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-4 p-6 glass-panel rounded-2xl border border-white/10 shadow-2xl z-30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CustomSelect
              label="AI Model"
              value={model}
              onChange={(e) => setModel(e.target.value as VeoModel)}
              icon={<SparklesIcon className="w-4 h-4 text-indigo-400" />}
              disabled={isRefMode}>
              {Object.values(VeoModel).map((modelValue) => (
                <option key={modelValue} value={modelValue}>
                  {modelValue === VeoModel.VEO_FAST ? 'Veo 3.1 Fast' : 'Veo 3.1 Pro'}
                </option>
              ))}
            </CustomSelect>
            <CustomSelect
              label="Format"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              icon={<RectangleStackIcon className="w-4 h-4 text-indigo-400" />}
              disabled={isRefMode || isExtendMode}>
              {Object.entries(aspectRatioDisplayNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </CustomSelect>
            <div>
              <CustomSelect
                label="Resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                icon={<TvIcon className="w-4 h-4 text-indigo-400" />}
                disabled={isRefMode || isExtendMode}>
                <option value={Resolution.P720}>720p (Extendable)</option>
                <option value={Resolution.P1080}>1080p (HQ)</option>
              </CustomSelect>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full relative">
        <div className="flex flex-col gap-2">
          {generationMode === GenerationMode.FRAMES_TO_VIDEO && (
            <div className="flex items-center justify-center gap-4 mb-2 p-4 bg-white/5 rounded-2xl border border-white/10">
              <ImageUpload label="Start Frame" image={startFrame} onSelect={setStartFrame} onRemove={() => { setStartFrame(null); setIsLooping(false); }} />
              {!isLooping && <ImageUpload label="End Frame" image={endFrame} onSelect={setEndFrame} onRemove={() => setEndFrame(null)} />}
            </div>
          )}
          {generationMode === GenerationMode.REFERENCES_TO_VIDEO && (
             <div className="flex flex-wrap items-center justify-center gap-2 mb-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                {referenceImages.map((img, idx) => (
                  <ImageUpload key={idx} image={img} label="" onSelect={() => {}} onRemove={() => setReferenceImages(imgs => imgs.filter((_, i) => i !== idx))} />
                ))}
                {referenceImages.length < 3 && <ImageUpload label="Add Ref" onSelect={img => setReferenceImages(imgs => [...imgs, img])} />}
             </div>
          )}
          {generationMode === GenerationMode.EXTEND_VIDEO && (
             <div className="flex items-center justify-center gap-4 mb-2 p-4 bg-white/5 rounded-2xl border border-white/10">
               <VideoUpload label="Base Video" video={inputVideo} onSelect={setInputVideo} onRemove={() => { setInputVideo(null); setInputVideoObject(null); }} />
             </div>
          )}

          <div className="flex items-end gap-3 glass-panel border border-white/10 rounded-2xl p-3 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <div className="relative" ref={modeSelectorRef}>
              <button
                type="button"
                onClick={() => setIsModeSelectorOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                {modeIcons[generationMode]}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isModeSelectorOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                  {[GenerationMode.TEXT_TO_VIDEO, GenerationMode.FRAMES_TO_VIDEO, GenerationMode.REFERENCES_TO_VIDEO].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSelectMode(mode)}
                      className={`w-full text-left flex items-center gap-3 p-3 text-sm font-semibold hover:bg-indigo-600/40 transition-colors ${generationMode === mode ? 'text-indigo-400 bg-white/5' : 'text-gray-400'}`}>
                      {modeIcons[mode]}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the agency video motion graphics..."
              className="flex-grow bg-transparent focus:outline-none resize-none text-base text-white placeholder-gray-600 max-h-48 py-2 font-medium"
              rows={1}
            />
            <button
              type="button"
              onClick={() => setIsSettingsOpen(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
              <SlidersHorizontalIcon className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="p-2.5 bg-white text-black rounded-xl hover:bg-indigo-400 hover:text-white disabled:bg-gray-800 disabled:text-gray-600 transition-all transform active:scale-90">
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              {isSubmitDisabled && tooltipText && (
                <div className="absolute bottom-full right-0 mb-3 w-48 px-3 py-2 bg-gray-900 border border-white/10 text-[10px] uppercase font-bold text-gray-400 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 tracking-widest text-center">
                  {tooltipText}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;