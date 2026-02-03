import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    }, [onImageSelect, disabled]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    }, [onImageSelect]);

    return (
        <div
            className="image-uploader"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <label className="file-label" style={{ opacity: disabled ? 0.5 : 1 }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={disabled}
                />
                <div className="upload-content">
                    <Upload size={36} />
                    <div className="upload-text">
                        <div className="upload-title">Upload Image</div>
                        <div className="upload-subtitle">Drag & drop or click to browse</div>
                    </div>
                </div>
            </label>
        </div>
    );
};
