import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { useSearchQuery } from "@/features/search/hooks/useSearchQuery";

describe("useSearchQuery hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
  );

  it("initializes with empty string when no URL query is present", () => {
    const { result } = renderHook(() => useSearchQuery(), { wrapper });
    expect(result.current.inputValue).toBe("");
    expect(result.current.debouncedQuery).toBe("");
  });

  it("updates inputValue immediately and debounces URL synchronization by 300ms", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchQuery({ debounceMs: 300, onSearch }), { wrapper });

    act(() => {
      result.current.setInputValue("Miss Luzon");
    });

    // Immediately updated locally
    expect(result.current.inputValue).toBe("Miss Luzon");
    expect(result.current.isDebouncing).toBe(true);
    expect(onSearch).not.toHaveBeenCalled();

    // Advance timer past debounceMs
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isDebouncing).toBe(false);
    expect(onSearch).toHaveBeenCalledWith("Miss Luzon");
  });

  it("submits query immediately upon calling submitQuery()", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchQuery({ debounceMs: 300, onSearch }), { wrapper });

    act(() => {
      result.current.setInputValue("Queen");
    });

    // Call submitQuery immediately before timer fires
    act(() => {
      result.current.submitQuery();
    });

    expect(result.current.isDebouncing).toBe(false);
    expect(onSearch).toHaveBeenCalledWith("Queen");
  });

  it("clears query immediately upon calling clearQuery()", () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useSearchQuery({ debounceMs: 300, onClear }), { wrapper });

    act(() => {
      result.current.setInputValue("Queen");
    });

    act(() => {
      result.current.clearQuery();
    });

    expect(result.current.inputValue).toBe("");
    expect(result.current.isDebouncing).toBe(false);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
