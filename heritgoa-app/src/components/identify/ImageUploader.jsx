import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, Sparkles } from 'lucide-react';

export default function ImageUploader({ onImageSelected, onAnalyze, selectedImage, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setValidationError('');
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationError('Invalid file format. Please upload a JPG, PNG, or WEBP photograph.');
      return;
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setValidationError('File size too large. Maximum allowed size is 10 MB.');
      return;
    }

    onImageSelected(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    onImageSelected(null);
    setValidationError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-800/50 hover:border-amber-500/60 hover:bg-slate-800/80'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4 ring-1 ring-amber-500/30">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Upload a Heritage Photograph
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
            Drag & drop an old building, monument, architectural element, or cultural object in Goa.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
            <ImageIcon className="w-4 h-4" />
            Choose Image File
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Supported: JPG, PNG, WEBP • Max file size: 10 MB
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-200">Image Ready for AI Analysis</span>
            </div>
            <button
              onClick={clearSelection}
              disabled={isAnalyzing}
              className="p-1.5 rounded-lg bg-slate-700/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700/50 max-h-[380px] flex items-center justify-center group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Uploaded Heritage Preview"
              className="max-h-[380px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 truncate max-w-xs">
              📄 <span className="text-slate-200 font-medium">{selectedImage.name}</span> ({(selectedImage.size / 1024).toFixed(1)} KB)
            </div>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isAnalyzing
                  ? 'bg-amber-500/50 text-slate-900 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Heritage Features...' : 'Analyze Heritage Features'}
            </button>
          </div>
        </div>
      )}

      {validationError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
