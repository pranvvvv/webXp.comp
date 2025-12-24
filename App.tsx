/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import {CurvedArrowDownIcon} from './components/icons';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import VideoResult from './components/VideoResult';
import {generateVideo} from './services/geminiService';
import {
  AppState,
  GenerateVideoParams,
  GenerationMode,
  Resolution,
  VideoFile,
} from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(
    null,
  );
  const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
  const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  // A single state to hold the initial values for the prompt form
  const [initialFormValues, setInitialFormValues] =
    useState<GenerateVideoParams | null>(null);

  // Check for API key on initial load
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn(
            'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
            error,
          );
          setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const showStatusError = (message: string) => {
    setErrorMessage(message);
    setAppState(AppState.ERROR);
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    if (window.aistudio) {
      try {
        if (!(await window.aistudio.hasSelectedApiKey())) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        console.warn(
          'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
          error,
        );
        setShowApiKeyDialog(true);
        return;
      }
    }

    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setLastConfig(params);
    setInitialFormValues(null);

    try {
      const {objectUrl, blob, video} = await generateVideo(params);
      setVideoUrl(objectUrl);
      setLastVideoBlob(blob);
      setLastVideoObject(video);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      let userFriendlyMessage = `Video generation failed: ${errorMessage}`;
      let shouldOpenDialog = false;

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Requested entity was not found.')) {
          userFriendlyMessage =
            'Model not found. This can be caused by an invalid API key or permission issues.';
          shouldOpenDialog = true;
        } else if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.toLowerCase().includes('permission denied')
        ) {
          userFriendlyMessage =
            'Your API key is invalid or lacks permissions. Please select a valid, billing-enabled API key.';
          shouldOpenDialog = true;
        }
      }

      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);

      if (shouldOpenDialog) {
        setShowApiKeyDialog(true);
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  }, [lastConfig, handleGenerate]);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    if (appState === AppState.ERROR && lastConfig) {
      handleRetry();
    }
  };

  const handleNewVideo = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setLastVideoObject(null);
    setLastVideoBlob(null);
    setInitialFormValues(null);
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      handleNewVideo();
    }
  }, [lastConfig, handleNewVideo]);

  const handleExtend = useCallback(async () => {
    if (lastConfig && lastVideoBlob && lastVideoObject) {
      try {
        const file = new File([lastVideoBlob], 'last_video.mp4', {
          type: lastVideoBlob.type,
        });
        const videoFile: VideoFile = {file, base64: ''};

        setInitialFormValues({
          ...lastConfig,
          mode: GenerationMode.EXTEND_VIDEO,
          prompt: '',
          inputVideo: videoFile,
          inputVideoObject: lastVideoObject,
          resolution: Resolution.P720,
          startFrame: null,
          endFrame: null,
          referenceImages: [],
          styleImage: null,
          isLooping: false,
        });

        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to process video for extension:', error);
        showStatusError(`Failed to prepare video for extension`);
      }
    }
  }, [lastConfig, lastVideoBlob, lastVideoObject]);

  const renderError = (message: string) => (
    <div className="text-center glass-panel border border-red-500/30 p-10 rounded-2xl max-w-lg">
      <h2 className="text-3xl font-extrabold text-red-500 mb-4">Generation Error</h2>
      <p className="text-gray-300 mb-8 leading-relaxed">{message}</p>
      <button
        onClick={handleTryAgainFromError}
        className="px-8 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] text-gray-200 flex flex-col font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      
      <header className="py-8 flex flex-col justify-center items-center px-8 relative z-10">
        <div className="flex items-center gap-1 mb-1">
           <span className="text-5xl webxp-logo webxp-blue">web</span>
           <span className="text-5xl webxp-logo text-white">Xp</span>
        </div>
        <p className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase">Professional Motion Studio</p>
      </header>

      <main className="w-full max-w-5xl mx-auto flex-grow flex flex-col px-6 pb-6 relative z-10 overflow-hidden">
        {appState === AppState.IDLE ? (
          <>
            <div className="flex-grow flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-2 animate-float">
                <h2 className="text-4xl font-extrabold tracking-tight text-white/90">
                  Transform Services into Cinematic Motion
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto px-4">
                  Create high-end motion graphics for websites, gyms, medical practices, and academic excellence with webXp's AI director.
                </p>
              </div>
              <div className="pt-8">
                 <CurvedArrowDownIcon className="w-16 h-16 text-indigo-500/40" />
              </div>
            </div>
            <div className="mt-auto">
              <PromptForm
                onGenerate={handleGenerate}
                initialValues={initialFormValues}
              />
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center w-full">
            {appState === AppState.LOADING && <LoadingIndicator />}
            {appState === AppState.SUCCESS && videoUrl && (
              <VideoResult
                videoUrl={videoUrl}
                onRetry={handleRetry}
                onNewVideo={handleNewVideo}
                onExtend={handleExtend}
                canExtend={lastConfig?.resolution === Resolution.P720}
              />
            )}
            {appState === AppState.ERROR &&
              errorMessage &&
              renderError(errorMessage)}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-gray-600 border-t border-white/5 bg-black/50 backdrop-blur-sm relative z-20">
        &copy; {new Date().getFullYear()} webXp Agency • Premium Web Development & Academic Support
      </footer>
    </div>
  );
};

export default App;