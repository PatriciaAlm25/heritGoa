import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import ImageUploader from '../components/identify/ImageUploader';
import LocationSelector from '../components/identify/LocationSelector';
import AiAnalysisCard from '../components/identify/AiAnalysisCard';
import MatchedSitesGrid from '../components/identify/MatchedSitesGrid';
import DisclaimerNotice from '../components/identify/DisclaimerNotice';
import { analyzeHeritagePhoto } from '../services/identifyApi';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function IdentifyHeritagePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [locationFilter, setLocationFilter] = useState({ district: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchedSites, setMatchedSites] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setMatchedSites([]);

    try {
      const response = await analyzeHeritagePhoto(selectedImage, locationFilter);
      if (response && response.success) {
        setAnalysisResult(response.analysis);
        setMatchedSites(response.potentialMatches || []);
      } else {
        setErrorMessage(response.error || 'Unable to complete AI heritage analysis.');
      }
    } catch (err) {
      console.error('[IdentifyPage] Error during analysis:', err);
      setErrorMessage('An unexpected error occurred while analyzing the image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setMatchedSites([]);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Goa AI Visual Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-playfair mb-4">
            Identify Goa's Heritage
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload a photograph of an old building, architectural element, monument, or cultural object in Goa.
            Our AI analyzes visible characteristics, while HeritGoa's verified database provides official historical context.
          </p>
        </div>

        {/* Input & Control Box */}
        <div className="max-w-3xl mx-auto mb-10">
          <LocationSelector
            value={locationFilter}
            onChange={(loc) => setLocationFilter(loc)}
          />

          <ImageUploader
            selectedImage={selectedImage}
            onImageSelected={(file) => {
              setSelectedImage(file);
              setAnalysisResult(null);
              setMatchedSites([]);
            }}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Loading Spinner / Steps */}
        {isAnalyzing && (
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center shadow-2xl my-8 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Analyzing Architectural Features...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Scanning visible masonry, apertures, roof styles, and querying 73 registered heritage locations in Goa...
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center mb-8">
            {errorMessage}
          </div>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Analysis completed for your uploaded image</span>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Analyze Another Image
              </button>
            </div>

            {/* 1. Gemini Visual Analysis Card */}
            <AiAnalysisCard analysis={analysisResult} />

            {/* 2. HeritGoa Verified Dataset Matching Grid */}
            <MatchedSitesGrid matches={matchedSites} />

            {/* 3. Responsible AI Disclaimer & Notice */}
            <DisclaimerNotice />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} HeritGoa — AI Heritage Intelligence Platform for Goa, India.</p>
        </div>
      </footer>
    </div>
  );
}
