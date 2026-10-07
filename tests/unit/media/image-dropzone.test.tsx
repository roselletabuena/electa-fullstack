import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';
import * as useImageUploadModule from '@/features/media/hooks/use-image-upload';

describe('ImageDropzone', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:http://localhost/mock-uuid'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders idle dropzone surface with accessibility attributes and label', () => {
    render(
      <ImageDropzone
        folder="events/banners"
        label="Event Cover Banner"
        helperText="Max 10MB JPEG, PNG, or WebP"
      />
    );

    expect(screen.getByText('Event Cover Banner')).toBeInTheDocument();
    expect(
      screen.getByText('Max 10MB JPEG, PNG, or WebP')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('renders initial image preview and remove button if initialPreviewUrl provided', () => {
    const onRemove = vi.fn();
    render(
      <ImageDropzone
        folder="contestants/avatars"
        initialPreviewUrl="https://example.com/existing-avatar.jpg"
        onRemove={onRemove}
      />
    );

    const img = screen.getByRole('img', { name: /preview/i });
    expect(img).toHaveAttribute(
      'src',
      'https://example.com/existing-avatar.jpg'
    );

    const removeBtn = screen.getByRole('button', { name: /remove image/i });
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalled();
  });

  it('displays progress bar during upload state', () => {
    vi.spyOn(useImageUploadModule, 'useImageUpload').mockReturnValue({
      status: 'uploading',
      progressPercent: 45,
      loadedBytes: 4500,
      totalBytes: 10000,
      previewUrl: 'blob:http://localhost/mock-uuid',
      uploadedAsset: null,
      error: null,
      isUploading: true,
      uploadFile: vi.fn(),
      cancelUpload: vi.fn(),
      retryUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(<ImageDropzone folder="events/banners" />);

    expect(screen.getByText('45%')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
  });

  it('calls uploadFile when file input changes', () => {
    const uploadFileMock = vi.fn();
    vi.spyOn(useImageUploadModule, 'useImageUpload').mockReturnValue({
      status: 'idle',
      progressPercent: 0,
      loadedBytes: 0,
      totalBytes: 0,
      previewUrl: null,
      uploadedAsset: null,
      error: null,
      isUploading: false,
      uploadFile: uploadFileMock,
      cancelUpload: vi.fn(),
      retryUpload: vi.fn(),
      reset: vi.fn(),
    });

    const { container } = render(<ImageDropzone folder="events/banners" />);
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(uploadFileMock).toHaveBeenCalledWith(file);
  });
});
