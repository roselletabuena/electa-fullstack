import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';

describe('ImageDropzone client validation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('immediately displays error message and does not dispatch network calls on invalid MIME type', async () => {
    const onError = vi.fn();
    const { container } = render(
      <ImageDropzone
        folder="events/banners"
        allowedMimeTypes={['image/jpeg', 'image/png']}
        onError={onError}
      />
    );

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const invalidFile = new File(['pdf-data'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText('Unsupported file format. Please upload jpeg, png.')
      ).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_MIME_TYPE' })
    );
  });

  it('immediately displays error message on oversized file without dispatching network calls', async () => {
    const onError = vi.fn();
    const { container } = render(
      <ImageDropzone
        folder="contestants/avatars"
        maxSizeBytes={2 * 1024 * 1024} // 2MB limit
        onError={onError}
      />
    );

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // 3MB file
    const oversizedFile = new File([new Uint8Array(3 * 1024 * 1024)], 'giant.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(
        screen.getByText('File size exceeds the maximum limit of 2MB.')
      ).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FILE_TOO_LARGE' })
    );
  });
});
