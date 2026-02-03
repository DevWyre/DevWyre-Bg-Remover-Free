import { useState, useEffect, useCallback } from 'react';
import { ModelSelector } from './components/ModelSelector';
import { ImageUploader } from './components/ImageUploader';
import ColorPicker from './components/ColorPicker';
import { loadModel, runInference, MODELS, ModelType } from './utils/onnxHelper';
import { processImage, applyMask } from './utils/imageProcessing';
import * as ort from 'onnxruntime-web';
import { Loader2, Download, X, Palette, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [outputTensor, setOutputTensor] = useState<ort.Tensor | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);

    const reprocessWithBackground = useCallback(() => {
        if (!selectedModel || !imageFile || !outputTensor || !originalImage) return;
        
        try {
            const targetSize = MODELS[selectedModel].size;
            const resultUrl = applyMask(originalImage, outputTensor, targetSize, backgroundColor);
            setProcessedImageUrl(resultUrl);
        } catch (e) {
            console.error(e);
            setStatus('Error applying background: ' + (e as Error).message);
        }
    }, [selectedModel, imageFile, outputTensor, originalImage, backgroundColor]);

    useEffect(() => {
        if (backgroundColor !== null) {
            reprocessWithBackground();
        }
    }, [backgroundColor, reprocessWithBackground]);

    const handleModelSelect = useCallback(async (model: ModelType) => {
        if (loading) return;
        setSelectedModel(model);
    }, [loading]);

    useEffect(() => {
        if (selectedModel && imageFile) {
            processImageHandler();
        }
    }, [selectedModel, imageFile]);

    const processImageHandler = async () => {
        if (!selectedModel || !imageFile) return;

        setLoading(true);
        setProcessedImageUrl(null);
        setBackgroundColor(null);
        setShowColorPicker(false);

        try {
            setStatus(`Loading ${MODELS[selectedModel].name} model...`);
            await loadModel(selectedModel, (p) => setProgress(p * 100));

            setStatus('Processing image...');
            const targetSize = MODELS[selectedModel].size;
            const modelCategory = selectedModel.startsWith('rmbg') ? 'rmbg' : selectedModel as 'u2netp' | 'silueta';
            const { tensor, originalImage: processedImage } = await processImage(imageFile, targetSize, modelCategory);
            setOriginalImage(processedImage);

            setStatus('Running inference...');
            const start = performance.now();
            const output = await runInference(tensor);
            setOutputTensor(output);
            const end = performance.now();

            setStatus('Applying mask...');
            const resultUrl = applyMask(processedImage, output, targetSize, backgroundColor);

            setProcessedImageUrl(resultUrl);
            setStatus(`Process completed in ${(end - start).toFixed(0)}ms`);
        } catch (e) {
            console.error(e);
            setStatus('Error: ' + (e as Error).message);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setOriginalImageUrl(URL.createObjectURL(file));
        setProcessedImageUrl(null);
        setBackgroundColor(null);
        setShowColorPicker(false);
    };

    const resetApplication = () => {
        setImageFile(null);
        setOriginalImageUrl(null);
        setProcessedImageUrl(null);
        setSelectedModel(null);
        setBackgroundColor(null);
        setShowColorPicker(false);
        setStatus('');
    };

    const handleDownload = (format: 'png' | 'jpg') => {
        if (!processedImageUrl) return;
        
        const link = document.createElement('a');
        link.href = processedImageUrl;
        link.download = `background-removed.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusIcon = () => {
        if (loading) return <Loader2 className="spin" size={18} />;
        if (status.includes('Error')) return <AlertCircle size={18} style={{ color: '#dc2626' }} />;
        if (status.includes('completed') || status.includes('Done')) return <CheckCircle size={18} style={{ color: '#059669' }} />;
        return null;
    };

    return (
        <div className="professional-container">
            <header className="professional-header">
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '1rem'
                }}>
                    <h1>Background Removal Tool Free</h1>
                    <p className="professional-header-subtitle">
                        Privacy-first in-browser processing with WebGPU & ONNX
                    </p>
                </div>
            </header>

            <main style={{ padding: '0 2rem' }}>
                <div className="professional-grid">
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="professional-card">
                            <div className="professional-section-header">
                                <h2 className="professional-section-title">AI Model Selection</h2>
                                <p className="professional-section-description">
                                    Choose the best model for your image
                                </p>
                            </div>
                            <ModelSelector
                                selectedModel={selectedModel}
                                onSelect={handleModelSelect}
                                disabled={loading}
                            />
                        </div>

                        <div className="professional-card">
                            <div className="professional-section-header">
                                <h2 className="professional-section-title">Processing Status</h2>
                            </div>
                            <div className="professional-status">
                                {getStatusIcon()}
                                <span style={{ flex: 1 }}>{status || 'Ready to process'}</span>
                            </div>
                            {loading && progress > 0 && progress < 100 && (
                                <div className="professional-progress-bar">
                                    <div 
                                        className="professional-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <span className="professional-progress-text">{progress.toFixed(0)}%</span>
                                </div>
                            )}
                        </div>

                        {processedImageUrl && (
                            <div className="professional-card">
                                <div className="professional-section-header">
                                    <h2 className="professional-section-title">Export Options</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleDownload('png')}
                                        className="professional-button"
                                    >
                                        <Download size={16} />
                                        Download PNG
                                    </button>
                                    <button
                                        onClick={() => handleDownload('jpg')}
                                        className="professional-button"
                                    >
                                        <Download size={16} />
                                        Download JPG
                                    </button>
                                    <button
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                        className="professional-button professional-button-outline"
                                    >
                                        <Palette size={16} />
                                        {backgroundColor ? 'Change Color' : 'Add Background'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </aside>

                    <div style={{ minHeight: '600px' }}>
                        {!originalImageUrl ? (
                            <div style={{ height: '100%' }}>
                                <div className="professional-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                                        <ImageUploader 
                                            onImageSelect={handleImageSelect} 
                                            disabled={loading}
                                        />
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <p>Upload an image to remove its background</p>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                                Supports JPG, PNG, and WebP formats
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '100%' }}>
                                <div className="professional-card">
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h2 style={{ margin: 0 }}>Image Results</h2>
                                        <button
                                            onClick={resetApplication}
                                            disabled={loading}
                                            aria-label="Reset application"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                background: 'white',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                padding: 0,
                                                flexShrink: 0
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '1.5rem',
                                        height: 'calc(100% - 3.5rem)'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 className="professional-image-title">Original Image</h3>
                                            </div>
                                            <div className="professional-image-container">
                                                <img 
                                                    src={originalImageUrl} 
                                                    alt="Original" 
                                                    className="professional-result-image"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 className="professional-image-title">Processed Result</h3>
                                            </div>
                                            <div className="professional-image-container">
                                                {processedImageUrl ? (
                                                    <img 
                                                        src={processedImageUrl} 
                                                        alt="Processed" 
                                                        className="professional-result-image"
                                                        style={{
                                                            backgroundColor: backgroundColor || undefined,
                                                            backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjTM3O/s9AAWDm4uRkZGBgYCCuH10t0jCgWj5o2kIAWw4v0/017R4AAAAASUVORK5CYII=)',
                                                            backgroundSize: '20px 20px'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: '#64748b'
                                                    }}>
                                                        {loading ? (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <Loader2 className="spin" size={40} />
                                                                <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                                                                    Processing image...
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                                <p>Ready for processing</p>
                                                                <p style={{ 
                                                                    fontSize: '0.875rem', 
                                                                    opacity: '0.7',
                                                                    marginTop: '0.5rem'
                                                                }}>
                                                                    Select a model to begin
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {showColorPicker && (
                                        <div style={{ 
                                            marginTop: '1.5rem',
                                            paddingTop: '1.5rem',
                                            borderTop: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                                                    Select Background Color
                                                </h3>
                                            </div>
                                            <ColorPicker
                                                value={backgroundColor}
                                                onChange={setBackgroundColor}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="professional-footer">
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        Privacy-first in-browser image editing powered by WebGPU
                    </p>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <a 
                        href="https://devwyre.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            color: '#60a5fa', 
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        Powered by DevWyre
                    </a>
                </div>
            </footer>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default App;