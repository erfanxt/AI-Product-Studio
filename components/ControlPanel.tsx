
import React from 'react';
import { GenerationType, AspectRatio, aspectRatios, StylePreset, GenerativeModel, generativeModels } from '../types';
import { ImageUploader } from './ImageUploader';
import { LoadingSpinner } from './LoadingSpinner';

interface ControlPanelProps {
  uploadedFile: File | null;
  onFileChange: (file: File | null) => void;
  referenceFile: File | null;
  onReferenceFileChange: (file: File | null) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  isPromptValid: boolean;
  generationType: GenerationType;
  onGenerationTypeChange: (type: GenerationType) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  numberOfImages: number;
  onNumberOfImagesChange: (num: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  productHint: string;
  onProductHintChange: (value: string) => void;
  onGeneratePrompt: () => void;
  isGeneratingPrompt: boolean;
  stylePresets: StylePreset[];
  activePresetKey: string | null;
  onPresetChange: (preset: StylePreset) => void;
  placeInContext: boolean;
  onPlaceInContextChange: (value: boolean) => void;
  // FIX: Removed apiKey and onApiKeyChange from props as it's no longer managed in the UI.
  selectedModel: GenerativeModel;
  onSelectedModelChange: (model: GenerativeModel) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  uploadedFile,
  onFileChange,
  referenceFile,
  onReferenceFileChange,
  prompt,
  onPromptChange,
  isPromptValid,
  generationType,
  onGenerationTypeChange,
  aspectRatio,
  onAspectRatioChange,
  numberOfImages,
  onNumberOfImagesChange,
  onGenerate,
  isLoading,
  productHint,
  onProductHintChange,
  onGeneratePrompt,
  isGeneratingPrompt,
  stylePresets,
  activePresetKey,
  onPresetChange,
  placeInContext,
  onPlaceInContextChange,
  // FIX: Removed apiKey and onApiKeyChange from props.
  selectedModel,
  onSelectedModelChange,
}) => {
  const isPhoto = generationType === GenerationType.Photo;
  const isCampaign = generationType === GenerationType.Campaign;
  const isSocialPost = generationType === GenerationType.SocialPost;
  const isMagicEdit = generationType === GenerationType.MagicEdit;
  
  const showAspectRatio = isPhoto || isSocialPost;
  const showContextToggle = isPhoto || isSocialPost;
  const showAdvancedPhotoControls = isPhoto;
  const showPromptGenerator = isPhoto || isCampaign || isSocialPost;
  const showPromptSection = isPhoto || isSocialPost || isCampaign || isMagicEdit;
  const showReferenceImage = isPhoto || isMagicEdit;
  const ratiosToShow = aspectRatios;

  let step = 3;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6 sticky top-8">
      <div>
        <LabelWithNumber num="1" text="Upload Your Product Image" />
        <ImageUploader file={uploadedFile} onFileChange={onFileChange} />
      </div>

      <div>
        {/* FIX: Changed label from "API & Model Settings" to "Model Settings". */}
        <LabelWithNumber num="2" text="Model Settings" />
        <div className="mt-2 space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          {/* FIX: Removed API key input field. */}
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-slate-300">
              Generative Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onSelectedModelChange(e.target.value as GenerativeModel)}
              className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-lg appearance-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {generativeModels.map((model) => (
                <option key={model.key} value={model.key}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <LabelWithNumber num="3" text="Choose Your Creation" />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button onClick={() => onGenerationTypeChange(GenerationType.Photo)} className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isPhoto ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>Photo</button>
          <button onClick={() => onGenerationTypeChange(GenerationType.MagicEdit)} className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isMagicEdit ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>🪄 Magic Edit</button>
          <button onClick={() => onGenerationTypeChange(GenerationType.SocialPost)} className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isSocialPost ? 'bg-sky-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>Social Post</button>
          <button onClick={() => onGenerationTypeChange(GenerationType.Campaign)} className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isCampaign ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>Campaign</button>
        </div>
      </div>

      {showAspectRatio && (
        <div>
          <LabelWithNumber num={`${++step}`} text="Set Aspect Ratio" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {ratiosToShow.map((ratio) => (
              <button
                key={ratio.key}
                onClick={() => onAspectRatioChange(ratio.key)}
                className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${
                  aspectRatio === ratio.key ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-pressed={aspectRatio === ratio.key}
              >
                {ratio.label}
                <span className="block text-xs text-slate-400 font-normal">{`(${ratio.key})`}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {showContextToggle && (
         <div>
          <LabelWithNumber num={`${++step}`} text="Place Product in Context" />
          <div className="mt-2 p-3 bg-slate-900/50 rounded-lg flex items-center justify-between">
            <label htmlFor="context-toggle-label" className="text-sm text-slate-300">
                <span id="context-toggle-label" className="font-semibold">Show on Model / In Scene</span>
                <p className="text-xs text-slate-400">For wearables, adds a model. For objects, places in a relevant environment.</p>
            </label>
            <button
                role="switch"
                aria-checked={placeInContext}
                onClick={() => onPlaceInContextChange(!placeInContext)}
                className={`${placeInContext ? 'bg-purple-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
                <span className={`${placeInContext ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
            </button>
          </div>
        </div>
      )}

      {showAdvancedPhotoControls && (
        <>
          <div>
            <LabelWithNumber num={`${++step}`} text="Apply a Style Preset" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {stylePresets.map((preset) => ( <button key={preset.key} onClick={() => onPresetChange(preset)} className={`p-2 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${ activePresetKey === preset.key ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600' }`} aria-pressed={activePresetKey === preset.key}> {preset.label} </button> ))}
            </div>
          </div>
          <div>
              <LabelWithNumber num={`${++step}`} text="Number of Photos" />
              <div className="grid grid-cols-3 gap-2 mt-2">
                  {[1, 2, 4].map((num) => ( <button key={num} onClick={() => onNumberOfImagesChange(num)} className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${ numberOfImages === num ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600' }`} aria-pressed={numberOfImages === num}> {num} {num > 1 ? 'Images' : 'Image'} </button> ))}
              </div>
          </div>
        </>
      )}

      {showPromptSection && <div>
        <LabelWithNumber num={`${++step}`} text={
          isPhoto ? "Craft Your Photo Scene" : 
          isSocialPost ? "Describe Your Desired Scene" :
          isCampaign ? "Craft Your Campaign Strategy" :
          "Describe Your Edit"
        } />
        <p className="text-sm text-slate-400 mt-1">
          {isMagicEdit ? "Use simple text to describe the change you want." : "Let our AI generate a creative JSON concept, or write/edit your own below."}
        </p>
        
        {showReferenceImage && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-300">Add Style Reference (Optional)</h3>
            <p className="text-xs text-slate-500 mb-2">Upload an image to guide the style, lighting, and composition.</p>
            <ImageUploader file={referenceFile} onFileChange={onReferenceFileChange} />
          </div>
        )}

        {showPromptGenerator && <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <label htmlFor="product-hint" className="block text-sm font-medium text-slate-300">
            What is this product? <span className="text-slate-500">(Optional but recommended)</span>
          </label>
          <input id="product-hint" type="text" value={productHint} onChange={(e) => onProductHintChange(e.target.value)} placeholder="e.g., a ceramic coffee mug" className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" disabled={isGeneratingPrompt || isLoading} />
           {/* FIX: Removed apiKey check from disabled logic. */}
           <button onClick={onGeneratePrompt} disabled={isGeneratingPrompt || !uploadedFile || isLoading} className="w-full flex items-center justify-center gap-2 p-3 mt-3 font-semibold text-white bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"> {isGeneratingPrompt ? <LoadingSpinner /> : '🤖 Generate Concept with AI'} </button>
        </div>}
        
        { isMagicEdit ? (
           <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g., Change the background to a sunny beach"
              className={`w-full h-24 p-3 mt-4 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-base border-slate-600`}
              aria-label="Prompt for magic edit"
            />
        ) :
          <>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Your generated or custom JSON prompt will appear here..."
              className={`w-full h-40 p-3 mt-4 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none font-mono text-sm ${!isPromptValid ? 'border-red-500' : 'border-slate-600'}`}
              aria-label="Prompt for generation"
              aria-invalid={!isPromptValid}
            />
            {!isPromptValid && <p className="text-xs text-red-400 mt-1">Invalid JSON format.</p>}
          </>
        }
      </div>}

      {/* FIX: Removed apiKey check from disabled logic. */}
      <button onClick={onGenerate} disabled={isLoading || !uploadedFile || !isPromptValid} className="w-full flex items-center justify-center gap-3 p-4 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
        {isLoading ? <LoadingSpinner /> : '✨ Generate Now'}
      </button>
    </div>
  );
};

const LabelWithNumber: React.FC<{ num: string, text: string }> = ({ num, text }) => (
  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-200">
    <span className="flex items-center justify-center w-6 h-6 text-sm font-bold bg-slate-700 rounded-full">{num}</span>
    {text}
  </h2>
);
