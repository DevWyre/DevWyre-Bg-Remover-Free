import React from 'react';
import { MODELS, ModelType } from '../utils/onnxHelper';
import { Check } from 'lucide-react';

interface ModelSelectorProps {
    selectedModel: ModelType | null;
    onSelect: (model: ModelType) => void;
    disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, disabled }) => {
    return (
        <div className="model-selector">
            <h3>Select Model</h3>
            <div className="model-grid">
                {(Object.keys(MODELS) as ModelType[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => onSelect(key)}
                        disabled={disabled}
                        className={`model-btn ${selectedModel === key ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: selectedModel === key ? 'var(--header-bg)' : 'var(--card-bg)',
                            color: selectedModel === key ? 'white' : 'var(--text-color)',
                            width: '100%',
                            marginBottom: '0.5rem',
                            textAlign: 'left',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.8rem 1rem',
                            transition: 'background-color 0.2s ease',
                            fontWeight: selectedModel === key ? 600 : 400
                        }}
                    >
                        <span>{MODELS[key].name}</span>
                        {selectedModel === key && <Check size={20} color="white" />}
                    </button>
                ))}
            </div>
        </div>
    );
};
