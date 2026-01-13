import React, { useState } from 'react';
import styled from 'styled-components';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove?: () => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

// 디자인 시스템 - 컬러 팔레트
const colors = {
  primary: '#E5002B',
  secondary: '#F88D2A',
  black: '#111111',
  grayDark: '#444444',
  grayLight: '#F5F5F5',
  white: '#FFFFFF',
  grayMedium: '#888888',
  grayBorder: '#E0E0E0',
  success: '#28a745',
  error: '#dc3545',
  info: '#17a2b8'
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.black};
  display: block;
`;

const UploadArea = styled.div<{ $dragOver: boolean; $disabled: boolean }>`
  position: relative;
  border: 2px dashed ${({ $dragOver }) => $dragOver ? colors.secondary : colors.grayBorder};
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  background: ${({ $dragOver }) => $dragOver ? '#fef7f0' : colors.white};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  &:hover {
    border-color: ${({ $disabled }) => $disabled ? colors.grayBorder : colors.secondary};
    background: ${({ $disabled, $dragOver }) => $disabled ? colors.white : $dragOver ? '#fef7f0' : '#fafafa'};
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const UploadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.grayBorder};
  border-top: 2px solid ${colors.secondary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const UploadingText = styled.span`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.875rem;
  color: ${colors.grayDark};
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 192px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${colors.grayBorder};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${colors.error};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #a71e2a;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UploadIcon = styled.div`
  color: ${colors.grayMedium};
  margin: 0 auto;
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const UploadText = styled.div`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.875rem;
  color: ${colors.grayDark};
`;

const UploadLink = styled.span`
  font-weight: 600;
  color: ${colors.secondary};
  transition: color 0.2s ease;
  
  &:hover {
    color: #e67e22;
  }
`;

const FileInfo = styled.p`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  color: ${colors.grayMedium};
  margin: 0;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageUpload,
  onImageRemove,
  accept = 'image/*',
  className = '',
  disabled = false,
  label = '이미지 업로드'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className={className}>
      {label && <Label>{label}</Label>}
      
      <UploadArea
        $dragOver={dragOver}
        $disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <HiddenInput
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
        
        {uploading ? (
          <UploadingContainer>
            <LoadingSpinner />
            <UploadingText>업로드 중...</UploadingText>
          </UploadingContainer>
        ) : currentImage ? (
          <ImageContainer>
            <PreviewImage src={currentImage} alt="미리보기" />
            {onImageRemove && (
              <RemoveButton type="button" onClick={onImageRemove}>
                이미지 제거
              </RemoveButton>
            )}
          </ImageContainer>
        ) : (
          <EmptyState>
            <UploadIcon>
              <svg stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </UploadIcon>
            <UploadText>
              <UploadLink>클릭하여 업로드</UploadLink>
              {' '}또는 드래그 앤 드롭
            </UploadText>
            <FileInfo>PNG, JPG, GIF 최대 10MB</FileInfo>
          </EmptyState>
        )}
      </UploadArea>
    </Container>
  );
};

export default ImageUploader; 