import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';

describe('ImageDropzone Accessibility', () => {
  it('supports keyboard navigation and triggers file input on Enter and Space keypress', () => {
    const { container } = render(
      <ImageDropzone folder="events/banners" label="Hero Banner" />
    );

    const dropzoneButton = screen.getByRole('button', {
      name: /upload hero banner/i,
    });
    expect(dropzoneButton).toHaveAttribute('tabIndex', '0');

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const inputClickSpy = vi.spyOn(fileInput, 'click');

    // Test Enter key
    fireEvent.keyDown(dropzoneButton, { key: 'Enter' });
    expect(inputClickSpy).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(dropzoneButton, { key: ' ' });
    expect(inputClickSpy).toHaveBeenCalledTimes(2);
  });

  it('renders polite aria-live status region for screen readers', () => {
    render(<ImageDropzone folder="events/banners" />);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('removes container from tab order when disabled', () => {
    render(<ImageDropzone folder="events/banners" disabled label="Disabled Banner" />);

    const dropzoneButton = screen.getByRole('button', {
      name: /upload disabled banner/i,
    });
    expect(dropzoneButton).toHaveAttribute('tabIndex', '-1');
    expect(dropzoneButton).toHaveClass('opacity-50');
  });
});
