import React, { useState, useRef } from 'react';

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [customColor, setCustomColor] = useState<string>('#000000');
    const colorPickerRef = useRef<HTMLDivElement>(null);

    const handleColorChange = (color: string | null) => {
        onChange(color);
        setShowPicker(false);
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomColor(e.target.value);
    };

    const applyCustomColor = () => {
        onChange(customColor);
        setShowPicker(false);
    };

    const presetColors = [
        { name: 'Black', value: '#000000', color: '#000000' },
        { name: 'White', value: '#FFFFFF', color: '#FFFFFF' },
        { name: 'Blue', value: '#0000FF', color: '#0000FF' }
    ];

    return (
        <div style={{ position: 'relative' }} ref={colorPickerRef}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {presetColors.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => handleColorChange(preset.value)}
                        style={{
                            width: '2rem',
                            height: '2rem',
                            backgroundColor: preset.color,
                            border: value === preset.value ? '2px solid #007bff' : '1px solid #ccc',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                        title={preset.name}
                    />
                ))}
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
                        border: showPicker ? '2px solid #007bff' : '1px solid #ccc',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                    title="Custom Color"
                />
            </div>

            {showPicker && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 100,
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    marginTop: '0.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="color"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            style={{ width: '50px', height: '40px' }}
                        />
                        <input
                            type="text"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            style={{ padding: '0.5rem', width: '100px' }}
                        />
                        <button 
                            onClick={applyCustomColor}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;