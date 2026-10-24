"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trash2,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  SlidersHorizontal,
  Video,
  Award,
  Ruler,
} from "lucide-react";
import type {
  ContestantMediaDto,
  ContestantFormModalProps,
  ContestantDto,
  DynamicDivisionItem,
  DivisionDto,
  AwardCategoryDto,
} from "../types";
import { ImageCropper } from "./ImageCropper";
import { parseVideoEmbedUrl } from "../utils/parse-video-embed";
import { useIsMounted } from "@/hooks/use-is-mounted";

type TabKey = "core" | "extended";

const STEP_LABELS: Record<TabKey, string> = {
  core: "Step 1 of 2: Core Profile & Gallery",
  extended: "Step 2 of 2: Extended Details",
};

export const OptionalBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <span className={`text-[11px] font-normal text-slate-500 dark:text-slate-400 ${className}`}>
    (optional)
  </span>
);

export const RequiredBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <span
    className={`font-bold text-rose-500 dark:text-rose-400 ${className}`}
    aria-hidden="true"
    title="Required field"
  >
    *
  </span>
);

const RequiredTabBadge: React.FC<{ hasErrors: boolean; isComplete: boolean }> = ({
  hasErrors,
  isComplete,
}) => {
  if (hasErrors) {
    return <span className="h-2 w-2 rounded-full bg-rose-500" title="Missing required fields" />;
  }
  if (isComplete) {
    return (
      <span className="h-2 w-2 rounded-full bg-emerald-500" title="All priority fields complete" />
    );
  }
  return null;
};

const findMatchingDivision = (
  divisions: DynamicDivisionItem[] | DivisionDto[],
  data?: ContestantDto | null,
): { name: string; id: string | undefined } | undefined => {
  if (!data) return undefined;
  if (data.divisionId) {
    const byId = divisions.find((d) => d.id === data.divisionId);
    if (byId) return { name: byId.name, id: byId.id };
  }
  const candidateName =
    data.divisionName ??
    data.divisionRef?.name ??
    (data.division && data.division !== "FEMALE" ? String(data.division) : "");

  if (candidateName) {
    const lower = candidateName.toLowerCase();
    const byName = divisions.find(
      (d) => d.name.toLowerCase() === lower || (d.id && d.id.toLowerCase() === lower),
    );
    if (byName) return { name: byName.name, id: byName.id };
  }
  return undefined;
};

const resolveInitialDivision = (
  divisions?: DynamicDivisionItem[] | DivisionDto[],
  data?: ContestantDto | null,
): { name: string; id: string | undefined } => {
  if (divisions && divisions.length > 0) {
    const match = findMatchingDivision(divisions, data);
    if (match) return match;
  }
  const fallbackName =
    data?.divisionRef?.name ??
    data?.divisionName ??
    (data?.division && data.division !== "FEMALE" ? String(data.division) : "");
  return {
    name: fallbackName,
    id: data?.divisionId ?? undefined,
  };
};

const validateContestantNumber = (value: number | string): string | undefined => {
  const num = Number(value);
  if (value === "" || isNaN(num) || num < 1 || !Number.isInteger(num)) {
    return "Valid candidate number (1 or greater) is required.";
  }
  return undefined;
};

const validateName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Candidate full name is required.";
  }
  if (trimmed.length > 100) {
    return "Full name must be at most 100 characters.";
  }
  return undefined;
};

const validateHeight = (heightCm?: number | undefined): string | undefined => {
  if (heightCm === undefined || heightCm === null || String(heightCm) === "") {
    return undefined;
  }
  const h = Number(heightCm);
  if (isNaN(h) || h < 50 || h > 250) {
    return "Height must be between 50 cm and 250 cm.";
  }
  return undefined;
};

const validateVideoUrl = (videoUrl: string): string | undefined => {
  const trimmed = videoUrl.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (!url.protocol.startsWith("http")) {
      return "Please enter a valid web URL starting with https://";
    }
  } catch {
    return "Please enter a valid URL (e.g. https://www.youtube.com/shorts/...).";
  }
  return undefined;
};

interface FormValidationInput {
  contestantNumber: number | string;
  name: string;
  heightCm?: number | undefined;
  hometown?: string | undefined;
  advocacy?: string | undefined;
  bio?: string | undefined;
  avatarUrl: string;
  galleryUrls: string[];
  videoUrl: string;
}

const validateContestantForm = (input: FormValidationInput): Record<string, string> => {
  const errors: Record<string, string> = {};

  const numErr = validateContestantNumber(input.contestantNumber);
  if (numErr) errors.contestantNumber = numErr;

  const nameErr = validateName(input.name);
  if (nameErr) errors.name = nameErr;

  const heightErr = validateHeight(input.heightCm);
  if (heightErr) errors.heightCm = heightErr;

  if (input.hometown && input.hometown.trim().length > 120) {
    errors.hometown = "Hometown must be at most 120 characters.";
  }
  if (input.advocacy && input.advocacy.trim().length > 1000) {
    errors.advocacy = "Advocacy statement must be at most 1,000 characters.";
  }
  if (input.bio && input.bio.trim().length > 1000) {
    errors.bio = "Biography must be at most 1,000 characters.";
  }
  if (!input.avatarUrl && input.galleryUrls.length === 0) {
    errors.photos = "Please upload at least one 4:5 portrait photo.";
  }

  const videoErr = validateVideoUrl(input.videoUrl);
  if (videoErr) errors.videoUrl = videoErr;

  return errors;
};

const getTabForFirstError = (errors: Record<string, string>): TabKey => {
  if (errors.contestantNumber || errors.name || errors.photos || errors.hometown) {
    return "core";
  }
  return "extended";
};

const getSubmitButtonLabel = (isSubmitting: boolean, hasInitialData: boolean): string => {
  if (isSubmitting) return "Saving...";
  if (hasInitialData) return "Update Profile";
  return "Register Contestant";
};

const buildMediaPayload = (
  galleryUrls: string[],
  videoUrl: string,
): Omit<ContestantMediaDto, "id" | "contestantId">[] => {
  const mediaList: Omit<ContestantMediaDto, "id" | "contestantId">[] = galleryUrls.map(
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

  const trimmedVideo = videoUrl.trim();
  if (trimmedVideo) {
    const parsed = parseVideoEmbedUrl(trimmedVideo);
    mediaList.push({
      mediaType: "VIDEO_EMBED",
      url: trimmedVideo,
      embedPlatform: parsed ? parsed.platform : "NONE",
      embedId: parsed ? parsed.embedId : null,
      displayOrder: mediaList.length,
      aspectRatio: "9:16",
      isCover: false,
    });
  }

  return mediaList;
};

const countOptionalValues = (fields: {
  division: string;
  hometown: string;
  heightCm?: number | undefined;
  advocacy: string;
  bio: string;
  videoUrl: string;
  galleryCount: number;
  categoriesCount: number;
  instagram: string;
  tiktok: string;
  facebook: string;
}): number => {
  let count = 0;
  if (fields.division) count++;
  if (fields.hometown.trim()) count++;
  if (fields.heightCm) count++;
  if (fields.advocacy.trim()) count++;
  if (fields.bio.trim()) count++;
  if (fields.videoUrl.trim()) count++;
  if (fields.galleryCount > 1) count += fields.galleryCount - 1;
  if (fields.categoriesCount > 0) count += fields.categoriesCount;
  if (fields.instagram.trim()) count++;
  if (fields.tiktok.trim()) count++;
  if (fields.facebook.trim()) count++;
  return count;
};

interface GalleryThumbnailProps {
  url: string;
  index: number;
  onSetCover: (idx: number) => void;
  onRemove: (idx: number) => void;
}

const GalleryThumbnail: React.FC<GalleryThumbnailProps> = ({
  url,
  index,
  onSetCover,
  onRemove,
}) => (
  <div className="group relative aspect-4/5 overflow-hidden rounded-none border border-slate-300 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-900">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt={`Candidate photo ${index + 1}`} className="h-full w-full object-cover" />
    {index === 0 ? (
      <div className="absolute top-1 left-1 rounded-none bg-sky-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white uppercase dark:bg-sky-500 dark:text-slate-950">
        ★ Cover
      </div>
    ) : (
      <button
        type="button"
        onClick={() => onSetCover(index)}
        className="absolute top-1 left-1 rounded-none bg-slate-900/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white opacity-90 transition-opacity hover:bg-sky-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        Set Cover
      </button>
    )}
    <button
      type="button"
      onClick={() => onRemove(index)}
      aria-label={`Remove photo ${index + 1}`}
      className="absolute top-1 right-1 rounded-none bg-slate-900/80 p-1 text-white opacity-90 transition-opacity hover:bg-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  </div>
);

interface CandidateGallerySectionProps {
  galleryUrls: string[];
  photoError?: string | undefined;
  onSetCover: (idx: number) => void;
  onRemovePhoto: (idx: number) => void;
  onAddCroppedPhoto: (cropped: string) => void;
}

const CandidateGallerySection: React.FC<CandidateGallerySectionProps> = ({
  galleryUrls,
  photoError,
  onSetCover,
  onRemovePhoto,
  onAddCroppedPhoto,
}) => (
  <div className="rounded-none border border-slate-200 bg-slate-50/50 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/40">
    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
        Candidate Photos & Gallery ({galleryUrls.length}/10) <RequiredBadge />
      </label>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        First photo is primary cover (4:5)
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
      {galleryUrls.map((url, idx) => (
        <GalleryThumbnail
          key={idx}
          url={url}
          index={idx}
          onSetCover={onSetCover}
          onRemove={onRemovePhoto}
        />
      ))}

      {galleryUrls.length < 10 && (
        <div className="aspect-4/5 w-full">
          <ImageCropper aspectRatio={4 / 5} compact={true} onCropComplete={onAddCroppedPhoto} />
        </div>
      )}
    </div>

    {photoError && (
      <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{photoError}</p>
    )}
  </div>
);

interface VideoReelSectionProps {
  videoUrl: string;
  videoError?: string | undefined;
  onVideoUrlChange: (url: string) => void;
}

const VideoReelSection: React.FC<VideoReelSectionProps> = ({
  videoUrl,
  videoError,
  onVideoUrlChange,
}) => (
  <div className="space-y-2 rounded-none border border-slate-200 p-3 sm:p-4 dark:border-slate-800">
    <div className="flex items-center gap-2">
      <Video className="h-4 w-4 text-sky-600 dark:text-sky-400" />
      <h4 className="font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase dark:text-slate-200">
        Vertical Video Reel (9:16)
      </h4>
    </div>

    <div>
      <input
        id="contestant-video"
        type="url"
        value={videoUrl}
        onChange={(e) => onVideoUrlChange(e.target.value)}
        placeholder="https://www.youtube.com/shorts/... or TikTok / Reels URL"
        className={`w-full rounded-none border bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
          videoError
            ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 dark:border-rose-500"
            : "border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700"
        }`}
      />
      {videoError ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{videoError}</p>
      ) : (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Supports YouTube Shorts, TikTok videos, or Instagram Reels.
        </p>
      )}
    </div>
  </div>
);

interface AdvocacyBioSectionProps {
  advocacy: string;
  bio: string;
  onAdvocacyChange: (val: string) => void;
  onBioChange: (val: string) => void;
}

const AdvocacyBioSection: React.FC<AdvocacyBioSectionProps> = ({
  advocacy,
  bio,
  onAdvocacyChange,
  onBioChange,
}) => (
  <div className="space-y-4 rounded-none border border-slate-200 p-3 sm:p-4 dark:border-slate-800">
    <h4 className="font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase dark:text-slate-200">
      Advocacy & Biography
    </h4>

    <div>
      <label
        htmlFor="contestant-advocacy"
        className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
      >
        Official Advocacy Statement
      </label>
      <textarea
        id="contestant-advocacy"
        rows={2}
        value={advocacy}
        onChange={(e) => onAdvocacyChange(e.target.value)}
        className="w-full rounded-none border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        placeholder="Official environmental, cultural, or community advocacy message..."
        maxLength={1000}
      />
      <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <span>Highlighted prominently on candidate voting profile.</span>
        <span className="font-mono">{advocacy.length}/1000</span>
      </div>
    </div>

    <div>
      <label
        htmlFor="contestant-bio"
        className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
      >
        Biography / Fun Facts
      </label>
      <textarea
        id="contestant-bio"
        rows={2}
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        className="w-full rounded-none border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        placeholder="Tell voters more about the candidate's hobbies, education, or achievements..."
        maxLength={1000}
      />
      <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <span>Personal background, accomplishments, or fun facts.</span>
        <span className="font-mono">{bio.length}/1000</span>
      </div>
    </div>
  </div>
);

interface AwardCategoriesSectionProps {
  categories?: AwardCategoryDto[] | undefined;
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
}

const AwardCategoriesSection: React.FC<AwardCategoriesSectionProps> = ({
  categories,
  selectedCategoryIds,
  onToggleCategory,
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div>
      <span className="mb-2 block text-xs font-bold text-slate-800 dark:text-slate-200">
        Eligible Award Categories
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((cat) => {
          const isChecked = selectedCategoryIds.includes(cat.id);
          return (
            <label
              key={cat.id}
              className={`flex cursor-pointer items-start gap-2.5 border p-2.5 transition-colors ${
                isChecked
                  ? "border-sky-600 bg-sky-50/70 text-slate-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-slate-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleCategory(cat.id)}
                className="mt-0.5 rounded-none border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <p className="text-xs font-bold">{cat.name}</p>
                {cat.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

interface SocialMediaSectionProps {
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  onInstagramChange: (val: string) => void;
  onTiktokChange: (val: string) => void;
  onFacebookChange: (val: string) => void;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  instagramUrl,
  tiktokUrl,
  facebookUrl,
  onInstagramChange,
  onTiktokChange,
  onFacebookChange,
}) => (
  <div>
    <span className="mb-2 block text-xs font-bold text-slate-800 dark:text-slate-200">
      Social Media Handles
    </span>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label
          htmlFor="contestant-instagram"
          className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          Instagram
        </label>
        <input
          id="contestant-instagram"
          type="text"
          placeholder="@username"
          value={instagramUrl}
          onChange={(e) => onInstagramChange(e.target.value)}
          className="w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div>
        <label
          htmlFor="contestant-tiktok"
          className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          TikTok
        </label>
        <input
          id="contestant-tiktok"
          type="text"
          placeholder="@username"
          value={tiktokUrl}
          onChange={(e) => onTiktokChange(e.target.value)}
          className="w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div>
        <label
          htmlFor="contestant-facebook"
          className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          Facebook
        </label>
        <input
          id="contestant-facebook"
          type="text"
          placeholder="facebook.com/..."
          value={facebookUrl}
          onChange={(e) => onFacebookChange(e.target.value)}
          className="w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
    </div>
  </div>
);

const ContestantFormModalContent: React.FC<Omit<ContestantFormModalProps, "isOpen">> = ({
  onClose,
  onSubmit,
  categories,
  divisions,
  initialData,
}) => {
  const isMounted = useIsMounted();
  const hasDivisions = Boolean(divisions && divisions.length > 0);

  const initialDiv = resolveInitialDivision(divisions, initialData);
  const [activeTab, setActiveTab] = useState<TabKey>("core");
  const [contestantNumber, setContestantNumber] = useState<number | string>(
    initialData?.contestantNumber ?? 1,
  );
  const [name, setName] = useState(initialData?.name ?? "");
  const [division, setDivision] = useState<string>(initialDiv.name);
  const [divisionId, setDivisionId] = useState<string | undefined>(initialDiv.id);
  const [hometown, setHometown] = useState(initialData?.hometown ?? "");
  const [heightCm, setHeightCm] = useState<number | undefined>(initialData?.heightCm ?? undefined);
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [advocacy, setAdvocacy] = useState(initialData?.advocacy ?? "");
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  };

  const handleAddCroppedPhoto = (croppedDataUrl: string) => {
    if (galleryUrls.length >= 10) {
      alert("Maximum of 10 photos reached.");
      return;
    }
    setGalleryUrls((prev) => [...prev, croppedDataUrl]);
    clearFieldError("photos");
  };

  const handleSetCoverPhoto = (index: number) => {
    const target = galleryUrls[index];
    if (!target) return;
    setGalleryUrls((prev) => [target, ...prev.filter((_, i) => i !== index)]);
  };

  const handleRemovePhoto = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const avatarUrl = galleryUrls[0] || "";

    const errors = validateContestantForm({
      contestantNumber,
      name,
      heightCm,
      hometown,
      advocacy,
      bio,
      avatarUrl,
      galleryUrls,
      videoUrl,
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setActiveTab(getTabForFirstError(errors));
      setErrorMsg("Please fix the errors indicated below before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const mediaPayload = buildMediaPayload(galleryUrls, videoUrl);

      await onSubmit({
        contestantNumber: Number(contestantNumber),
        name: name.trim(),
        division,
        divisionId: divisionId ?? undefined,
        hometown: hometown.trim() || undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        bio: bio.trim() || undefined,
        advocacy: advocacy.trim() || undefined,
        avatarUrl,
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        categoryIds: selectedCategoryIds,
        media: mediaPayload,
      });

      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save contestant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  const hasRequiredErrors = Boolean(
    fieldErrors.contestantNumber || fieldErrors.name || fieldErrors.photos,
  );
  const isAllRequiredFilled = Boolean(
    contestantNumber !== "" && name.trim() && galleryUrls.length > 0,
  );

  const optionalFilledCount = countOptionalValues({
    division,
    hometown,
    heightCm,
    advocacy,
    bio,
    videoUrl,
    galleryCount: galleryUrls.length,
    categoriesCount: selectedCategoryIds.length,
    instagram: instagramUrl,
    tiktok: tiktokUrl,
    facebook: facebookUrl,
  });

  const submitButtonLabel = getSubmitButtonLabel(isSubmitting, Boolean(initialData));

  return createPortal(
    <dialog
      open
      aria-modal="true"
      aria-labelledby="contestant-modal-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-2.5 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="fixed inset-0 cursor-default border-none bg-slate-900/60 backdrop-blur-xs"
      />

      <div className="relative z-10 flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-2xl sm:max-h-[92vh] dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Modal Header without Sparkles */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <h3
            id="contestant-modal-title"
            className="font-heading text-sm font-extrabold tracking-tight text-slate-900 sm:text-base dark:text-slate-100"
          >
            {initialData ? "Edit Contestant Profile" : "Register New Contestant"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs: Core Profile & Gallery vs Extended Details */}
        <div
          role="tablist"
          aria-label="Contestant Registration Steps"
          className="no-scrollbar flex shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50/50 px-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <button
            type="button"
            role="tab"
            id="tab-core"
            aria-controls="tabpanel-core"
            aria-selected={activeTab === "core"}
            onClick={() => setActiveTab("core")}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:py-3 ${
              activeTab === "core"
                ? "border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span>01. Core Profile & Gallery</span>
            <RequiredTabBadge hasErrors={hasRequiredErrors} isComplete={isAllRequiredFilled} />
          </button>

          <button
            type="button"
            role="tab"
            id="tab-extended"
            aria-controls="tabpanel-extended"
            aria-selected={activeTab === "extended"}
            onClick={() => setActiveTab("extended")}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:py-3 ${
              activeTab === "extended"
                ? "border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            <span>02. Extended Details</span>
            {optionalFilledCount > 0 && (
              <span className="rounded-none bg-sky-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {optionalFilledCount} Added
              </span>
            )}
          </button>
        </div>

        {/* Form Container with noValidate */}
        <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {errorMsg && (
              <div className="mb-5 rounded-none border border-rose-200 bg-rose-50/90 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: CORE PROFILE & GALLERY (NUMBER, NAME, HOMETOWN, GALLERY) */}
            <div
              role="tabpanel"
              id="tabpanel-core"
              aria-labelledby="tab-core"
              className={activeTab === "core" ? "space-y-6" : "hidden"}
            >
              {/* Row 1: Candidate Number & Full Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="contestant-number"
                    className="mb-1 block text-xs font-bold whitespace-nowrap text-slate-800 dark:text-slate-200"
                  >
                    Candidate # <RequiredBadge />
                  </label>
                  <input
                    id="contestant-number"
                    type="number"
                    min={1}
                    value={contestantNumber}
                    onChange={(e) => {
                      setContestantNumber(e.target.value === "" ? "" : Number(e.target.value));
                      clearFieldError("contestantNumber");
                    }}
                    className={`w-full rounded-none border bg-white px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                      fieldErrors.contestantNumber
                        ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 dark:border-rose-500"
                        : "border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700"
                    }`}
                    placeholder="1"
                  />
                  {fieldErrors.contestantNumber && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.contestantNumber}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-9">
                  <label
                    htmlFor="contestant-name"
                    className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    Full Name <RequiredBadge />
                  </label>
                  <input
                    id="contestant-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    className={`w-full rounded-none border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                      fieldErrors.name
                        ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 dark:border-rose-500"
                        : "border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700"
                    }`}
                    placeholder="e.g. Maria Clara Santos"
                    maxLength={100}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Priority 2: Hometown / Province */}
                <div className={hasDivisions ? "sm:col-span-7" : "sm:col-span-12"}>
                  <label
                    htmlFor="contestant-hometown"
                    className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    Hometown / Province <OptionalBadge />
                  </label>
                  <input
                    id="contestant-hometown"
                    type="text"
                    value={hometown}
                    onChange={(e) => {
                      setHometown(e.target.value);
                      clearFieldError("hometown");
                    }}
                    className="w-full rounded-none border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="e.g. Vigan, Ilocos Sur"
                    maxLength={120}
                  />
                  {fieldErrors.hometown && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.hometown}
                    </p>
                  )}
                </div>

                {/* Optional Division */}
                {hasDivisions && (
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="contestant-division"
                      className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      Division <OptionalBadge />
                    </label>
                    <select
                      id="contestant-division"
                      value={division}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDivision(val);
                        const matched = divisions?.find((d) => d.name === val);
                        setDivisionId(matched ? matched.id : undefined);
                      }}
                      className="w-full rounded-none border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="">No Division (Optional)</option>
                      {divisions?.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Candidate Gallery & Photos in Core Profile */}
              <CandidateGallerySection
                galleryUrls={galleryUrls}
                photoError={fieldErrors.photos}
                onSetCover={handleSetCoverPhoto}
                onRemovePhoto={handleRemovePhoto}
                onAddCroppedPhoto={handleAddCroppedPhoto}
              />
            </div>

            {/* TAB 2: EXTENDED DETAILS (BIO, VIDEO REEL, PHYSICAL, AWARDS, SOCIALS) */}
            <div
              role="tabpanel"
              id="tabpanel-extended"
              aria-labelledby="tab-extended"
              className={activeTab === "extended" ? "space-y-6" : "hidden"}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All fields below are optional and can be updated at any time.
              </p>

              {/* SECTION A: VIDEO REEL */}
              <VideoReelSection
                videoUrl={videoUrl}
                videoError={fieldErrors.videoUrl}
                onVideoUrlChange={(val) => {
                  setVideoUrl(val);
                  clearFieldError("videoUrl");
                }}
              />

              {/* SECTION B: PHYSICAL ATTRIBUTES */}
              <div className="rounded-none border border-slate-200 p-3 sm:p-4 dark:border-slate-800">
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <h4 className="font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                    Physical Attributes
                  </h4>
                </div>

                <div className="w-full max-w-xs">
                  <label
                    htmlFor="contestant-height"
                    className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    Height (cm)
                  </label>
                  <input
                    id="contestant-height"
                    type="number"
                    min={50}
                    max={250}
                    value={heightCm ?? ""}
                    onChange={(e) => {
                      setHeightCm(e.target.value ? Number(e.target.value) : undefined);
                      clearFieldError("heightCm");
                    }}
                    className={`w-full rounded-none border bg-white px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                      fieldErrors.heightCm
                        ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 dark:border-rose-500"
                        : "border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700"
                    }`}
                    placeholder="e.g. 175"
                  />
                  {fieldErrors.heightCm && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.heightCm}
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION C: ADVOCACY & BIOGRAPHY */}
              <AdvocacyBioSection
                advocacy={advocacy}
                bio={bio}
                onAdvocacyChange={(val) => {
                  setAdvocacy(val);
                  clearFieldError("advocacy");
                }}
                onBioChange={(val) => {
                  setBio(val);
                  clearFieldError("bio");
                }}
              />

              {/* SECTION D: AWARDS & SOCIAL MEDIA */}
              <div className="space-y-4 rounded-none border border-slate-200 p-3 sm:p-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <h4 className="font-heading text-xs font-extrabold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                    Award Categories & Social Profiles
                  </h4>
                </div>

                <AwardCategoriesSection
                  categories={categories}
                  selectedCategoryIds={selectedCategoryIds}
                  onToggleCategory={handleToggleCategory}
                />

                <SocialMediaSection
                  instagramUrl={instagramUrl}
                  tiktokUrl={tiktokUrl}
                  facebookUrl={facebookUrl}
                  onInstagramChange={setInstagramUrl}
                  onTiktokChange={setTiktokUrl}
                  onFacebookChange={setFacebookUrl}
                />
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="flex shrink-0 flex-col gap-2.5 border-t border-slate-200 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {STEP_LABELS[activeTab]}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              {activeTab === "core" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("extended")}
                  className="flex items-center gap-1 rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100 hover:text-slate-950 sm:px-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span>Extended Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("core")}
                  className="flex items-center gap-1 rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100 hover:text-slate-950 sm:px-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Core Profile</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary rounded-none px-4 py-2 text-xs disabled:opacity-50 sm:px-6"
              >
                {submitButtonLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>,
    document.body,
  );
};

export const ContestantFormModal: React.FC<ContestantFormModalProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <ContestantFormModalContent
      key={props.initialData?.id ?? "new-contestant"}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
      categories={props.categories}
      divisions={props.divisions}
      initialData={props.initialData}
    />
  );
};
