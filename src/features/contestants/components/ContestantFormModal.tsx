"use client";

import React, { useState } from "react";
import { X, Sparkles, Trash2 } from "lucide-react";
import type {
  ContestantDto,
  AwardCategoryDto,
  ContestantMediaDto,
  CreateContestantInput,
  DynamicDivisionItem,
} from "../types";
import { ImageCropper } from "./ImageCropper";
import { parseVideoEmbedUrl } from "../utils/parse-video-embed";

interface ContestantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContestantInput) => Promise<void>;
  categories: AwardCategoryDto[];
  divisions?: DynamicDivisionItem[] | undefined;
  initialData?: ContestantDto | null;
}

export const ContestantFormModal: React.FC<ContestantFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  divisions,
  initialData,
}) => {
  const resolveInitialDivision = (): { name: string; id: string | undefined } => {
    if (divisions && divisions.length > 0) {
      const match =
        (initialData?.divisionId && divisions.find((d) => d.id === initialData.divisionId)) ||
        (initialData?.divisionName &&
          divisions.find((d) => d.name.toLowerCase() === initialData.divisionName?.toLowerCase())) ||
        (initialData?.divisionRef?.name &&
          divisions.find(
            (d) => d.name.toLowerCase() === initialData.divisionRef?.name.toLowerCase(),
          )) ||
        (initialData?.division &&
          divisions.find(
            (d) =>
              d.name.toLowerCase() === String(initialData.division).toLowerCase() ||
              (d.id && d.id === initialData.division),
          )) ||
        (initialData?.division &&
          divisions.find((d) =>
            d.name.toLowerCase().includes(String(initialData.division).toLowerCase().slice(0, 4)),
          )) ||
        divisions[0];
      return {
        name: match?.name ?? divisions[0]?.name ?? "FEMALE",
        id: match?.id ?? divisions[0]?.id ?? undefined,
      };
    }
    return {
      name: (initialData?.division as string) ?? "FEMALE",
      id: undefined,
    };
  };

  const initialDiv = resolveInitialDivision();
  const [contestantNumber, setContestantNumber] = useState<number>(
    initialData?.contestantNumber ?? 1,
  );
  const [name, setName] = useState(initialData?.name ?? "");
  const [division, setDivision] = useState<string>(initialDiv.name);
  const [divisionId, setDivisionId] = useState<string | undefined>(initialDiv.id);
  const [hometown, setHometown] = useState(initialData?.hometown ?? "");
  const [heightCm, setHeightCm] = useState<number | undefined>(initialData?.heightCm ?? undefined);
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [advocacy, setAdvocacy] = useState(initialData?.advocacy ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(
    initialData?.media.find((m) => m.mediaType === "VIDEO_EMBED")?.url ?? "",
  );
  const [instagramUrl, setInstagramUrl] = useState(initialData?.instagramUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(initialData?.tiktokUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initialData?.facebookUrl ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories.map((c) => c.id) ?? [],
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialData?.media.filter((m) => m.mediaType === "PHOTO").map((m) => m.url) ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  };

  const handleAddCroppedPhoto = (croppedDataUrl: string) => {
    if (!avatarUrl) {
      setAvatarUrl(croppedDataUrl);
    }
    if (galleryUrls.length < 10) {
      setGalleryUrls((prev) => [...prev, croppedDataUrl]);
    } else {
      alert("Maximum of 10 photos reached.");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Candidate name is required.");
      return;
    }
    if (!avatarUrl && galleryUrls.length === 0) {
      setErrorMsg("Please upload at least one portrait photo.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const mediaPayload: Omit<ContestantMediaDto, "id" | "contestantId">[] = galleryUrls.map(
        (url, idx) => ({
          mediaType: "PHOTO",
          url,
          embedPlatform: "NONE",
          embedId: null,
          displayOrder: idx,
          aspectRatio: "4:5",
          isCover: idx === 0,
        }),
      );

      if (videoUrl.trim()) {
        const parsed = parseVideoEmbedUrl(videoUrl.trim());
        mediaPayload.push({
          mediaType: "VIDEO_EMBED",
          url: videoUrl.trim(),
          embedPlatform: parsed ? parsed.platform : "NONE",
          embedId: parsed ? parsed.embedId : null,
          displayOrder: mediaPayload.length,
          aspectRatio: "9:16",
          isCover: false,
        });
      }

      await onSubmit({
        contestantNumber: Number(contestantNumber),
        name: name.trim(),
        division,
        divisionId: divisionId ?? undefined,
        hometown: hometown.trim() || undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        bio: bio.trim() || undefined,
        advocacy: advocacy.trim() || undefined,
        avatarUrl: avatarUrl || galleryUrls[0] || "",
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        categoryIds: selectedCategoryIds,
        media: mediaPayload,
      });

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save contestant.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {initialData ? "Edit Contestant Profile" : "Register New Contestant"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-6">
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Identity Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Candidate Number *
              </label>
              <input
                type="number"
                min={1}
                required
                value={contestantNumber}
                onChange={(e) => setContestantNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Clara Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Division *
              </label>
              <select
                value={division}
                onChange={(e) => {
                  const val = e.target.value;
                  if (divisions && divisions.length > 0) {
                    const matched = divisions.find((d) => d.name === val || d.id === val);
                    setDivision(matched ? matched.name : val);
                    setDivisionId(matched?.id);
                  } else {
                    setDivision(val);
                    setDivisionId(undefined);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {divisions && divisions.length > 0 ? (
                  divisions.map((d) => (
                    <option key={d.id ?? d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="LGBTQ">LGBTQ+</option>
                    <option value="TEEN">Teen</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Hometown / Province
              </label>
              <input
                type="text"
                placeholder="e.g. Vigan, Ilocos Sur"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Height (cm)
              </label>
              <input
                type="number"
                min={50}
                max={250}
                placeholder="e.g. 175"
                value={heightCm ?? ""}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Photo Gallery & Cropper */}
          <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Photo Gallery (Up to 10 Photos, 4:5 Aspect Ratio)
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {galleryUrls.length} / 10 added
              </span>
            </div>

            {/* Display Current Thumbnails */}
            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {galleryUrls.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-4/5 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute inset-0 flex items-center justify-center bg-red-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1 text-[8px] font-bold text-white shadow-xs">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {galleryUrls.length < 10 && (
              <ImageCropper onCropComplete={handleAddCroppedPhoto} aspectRatio={4 / 5} />
            )}
          </div>

          {/* Video Embed */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-800/80">
            <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Video Reel URL (YouTube Shorts, TikTok, Instagram Reel, Facebook Video)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/shorts/... or https://tiktok.com/@user/video/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Advocacy & Bio */}
          <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800/80">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Official Advocacy Statement
              </label>
              <textarea
                rows={2}
                maxLength={1000}
                placeholder="Official environmental or cultural advocacy message..."
                value={advocacy}
                onChange={(e) => setAdvocacy(e.target.value)}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Biography / Fun Facts
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Tell the voters more about the candidate..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Award Categories Assignment */}
          {categories.length > 0 && (
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800/80">
              <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Nominate for Award Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        checked
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-800/80">
            <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Social Media Handles
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Instagram
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  TikTok
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Facebook
                </label>
                <input
                  type="text"
                  placeholder="facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : initialData ? "Update Profile" : "Register Contestant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
