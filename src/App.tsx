import { useState, useEffect, useCallback } from 'react';
import { ModelSelector } from './components/ModelSelector';
import { ImageUploader } from './components/ImageUploader';
import ColorPicker from './components/ColorPicker';
import { loadModel, runInference, MODELS, ModelType } from './utils/onnxHelper';
import { processImage, applyMask } from './utils/imageProcessing';
import * as ort from 'onnxruntime-web';
import { Loader2, Download, X, Palette, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import WhyUseSection from './components/WhyUseSection';

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
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                padding: '1.5rem 2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem' 
                }}>
                    <img 
                        src="/1000016806.jpg" 
                        alt="Company Logo" 
                        style={{ 
                            height: '80px', 
                            width: '80px', 
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 255, 255, 0.1)'
                        }} 
                    />
                    <div>
                        <h1 style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: '600', 
                            margin: '0 0 0.25rem 0',
                            letterSpacing: '-0.025em'
                        }}>
                            Background Removal Tool Free
                        </h1>
                        <p style={{ 
                            fontSize: '0.875rem', 
                            opacity: '0.8', 
                            margin: '0',
                            fontWeight: '400'
                        }}>
                            Professional AI-powered image processing
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ 
                flex: '1', 
                padding: '2rem', 
                backgroundColor: '#f8fafc'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    display: 'grid', 
                    gridTemplateColumns: '320px 1fr', 
                    gap: '2rem' 
                }}>
                    {/* Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h2 style={{ 
                                    fontSize: '1.125rem', 
                                    fontWeight: '600', 
                                    color: '#0f172a', 
                                    margin: '0 0 0.25rem 0' 
                                }}>
                                    Model Selection
                                </h2>
                                <p style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#64748b', 
                                    margin: '0' 
                                }}>
                                    Choose AI model for processing
                                </p>
                            </div>
                            <ModelSelector
                                selectedModel={selectedModel}
                                onSelect={handleModelSelect}
                                disabled={loading}
                            />
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h2 style={{ 
                                    fontSize: '1.125rem', 
                                    fontWeight: '600', 
                                    color: '#0f172a', 
                                    margin: '0 0 0.25rem 0' 
                                }}>
                                    Processing Status
                                </h2>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    minHeight: '2.5rem'
                                }}>
                                    {getStatusIcon()}
                                    <span style={{ 
                                        fontSize: '0.875rem', 
                                        color: '#475569',
                                        flex: '1'
                                    }}>
                                        {status || 'Ready to process'}
                                    </span>
                                </div>
                                
                                {loading && progress > 0 && progress < 100 && (
                                    <div style={{ 
                                        background: '#e2e8f0',
                                        borderRadius: '999px',
                                        height: '8px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ 
                                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                            height: '100%',
                                            borderRadius: '999px',
                                            width: `${progress}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                        <span style={{ 
                                            position: 'absolute', 
                                            right: '0', 
                                            top: '-1.5rem',
                                            fontSize: '0.75rem',
                                            color: '#64748b'
                                        }}>
                                            {progress.toFixed(0)}%
                                        </span>
                                    </div>
                                )}

                                {showColorPicker && (
                                    <div style={{ 
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <h3 style={{ 
                                                fontSize: '0.875rem', 
                                                fontWeight: '500', 
                                                color: '#475569',
                                                margin: '0 0 0.25rem 0'
                                            }}>
                                                Background Color
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

                        {processedImageUrl && (
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <h2 style={{ 
                                        fontSize: '1.125rem', 
                                        fontWeight: '600', 
                                        color: '#0f172a', 
                                        margin: '0 0 0.25rem 0' 
                                    }}>
                                        Export Options
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleDownload('png')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1rem',
                                            borderRadius: '6px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                        <Download size={16} />
                                        Download PNG
                                    </button>
                                    <button
                                        onClick={() => handleDownload('jpg')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1rem',
                                            borderRadius: '6px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                        <Download size={16} />
                                        Download JPG
                                    </button>
                                    <button
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1rem',
                                            borderRadius: '6px',
                                            background: 'transparent',
                                            color: '#64748b',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Palette size={16} />
                                        {backgroundColor ? 'Change Color' : 'Add Background'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div style={{ minHeight: '600px' }}>
                        {!originalImageUrl ? (
                            <div style={{ height: '100%' }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '3rem',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                                        <ImageUploader 
                                            onImageSelect={handleImageSelect} 
                                            disabled={loading}
                                        />
                                        <div style={{ marginTop: '1.5rem', color: '#64748b' }}>
                                            <p>Upload an image to remove its background</p>
                                            <p style={{ 
                                                fontSize: '0.875rem', 
                                                marginTop: '0.5rem', 
                                                opacity: '0.7' 
                                            }}>
                                                Supports JPG, PNG, and WebP formats
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '100%' }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    height: '100%',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h2 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: '600', 
                                            color: '#0f172a',
                                            margin: '0'
                                        }}>
                                            Image Results
                                        </h2>
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
                                                color: '#000000',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                padding: '0',
                                                flexShrink: 0
                                                
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                            onFocus={(e) => e.currentTarget.style.outline = '2px solid #000000'}
                                            onBlur={(e) => e.currentTarget.style.outline = 'none'}
                                        >
                                            <X size={30} />
                                        </button>
                                    </div>

                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '1.5rem',
                                        height: 'calc(100% - 3.5rem)'
                                    }}>
                                        {/* Original Image Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 style={{ 
                                                    fontSize: '0.875rem', 
                                                    fontWeight: '500', 
                                                    color: '#475569',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    margin: '0'
                                                }}>
                                                    Original Image
                                                </h3>
                                            </div>
                                            <div style={{
                                                position: 'relative',
                                                paddingBottom: '100%', // Maintain aspect ratio
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <img
                                                    src={originalImageUrl}
                                                    alt="Original"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        display: 'block'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Processed Image Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h3 style={{ 
                                                    fontSize: '0.875rem', 
                                                    fontWeight: '500', 
                                                    color: '#475569',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    margin: '0'
                                                }}>
                                                    Processed Result
                                                </h3>
                                            </div>
                                            <div style={{ 
                                                flex: '1',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {processedImageUrl ? (
                                                    <img 
                                                        src={processedImageUrl} 
                                                        alt="Processed" 
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            display: 'block',
                                                            backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjTM3O/s9AAWDm4uRkZGBgYCCuH10t0jCgWj5o2kIAWw4v0/017R4AAAAASUVORK5CYII=)',
                                                            backgroundSize: '20px 20px',
                                                            backgroundColor: backgroundColor || undefined
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
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Why Use This Site Section */}
            <WhyUseSection />

            <footer style={{
                background: '#0f172a',
                color: '#cbd5e1',
                padding: '1.5rem 2rem',
                marginTop: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 0
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <p style={{ fontSize: '0.875rem', margin: '0' }}>
                        © {new Date().getFullYear()} Background Removal Tool Free
                    </p>
                    <a
                        href="https://devwyre.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#60a5fa',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#93c5fd'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#60a5fa'}
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
                @media (max-width: 1024px) {
                    div[style*="grid-template-columns: 320px 1fr"] {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
                @media (max-width: 768px) {
                    main {
                        padding: 1.5rem !important;
                    }
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                    }
                    footer > div {
                        flex-direction: column !important;
                        gap: 0.5rem !important;
                        text-align: center !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default App;