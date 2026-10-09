import type { DivisionDto } from "@/features/events/types";

export type { DivisionDto };

export type ContestantDivision = "FEMALE" | "MALE" | "LGBTQ" | "TEEN";

export type ContestantStatus = "ACTIVE" | "HIDDEN" | "WITHDRAWN";

export type MediaType = "PHOTO" | "VIDEO_EMBED";

export type EmbedPlatform = "YOUTUBE" | "TIKTOK" | "INSTAGRAM" | "FACEBOOK" | "NONE";

export interface ContestantMediaDto {
  id: string;
  contestantId?: string;
  mediaType: MediaType;
  url: string;
  embedPlatform: EmbedPlatform;
  embedId?: string | null;
  displayOrder: number;
  aspectRatio: string;
  isCover: boolean;
  createdAt?: string | Date;
}

export interface AwardCategoryDto {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  isVotingOpen: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DynamicDivisionItem {
  id?: string | undefined;
  name: string;
  description?: string | null | undefined;
  displayOrder?: number | undefined;
}

export interface ContestantDto {
  id: string;
  eventId: string;
  contestantNumber: number;
  name: string;
  division: string;
  divisionId?: string | null | undefined;
  divisionName?: string | null | undefined;
  divisionRef?: { id: string; name: string } | null | undefined;
  status: ContestantStatus;
  hometown?: string | null;
  heightCm?: number | null;
  bio?: string | null;
  advocacy?: string | null;
  avatarUrl: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  voteCount: number;
  media: ContestantMediaDto[];
  categories: AwardCategoryDto[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ContestantFilters {
  division?: string | undefined;
  categoryId?: string | undefined;
  status?: ContestantStatus | "ALL" | undefined;
}

export interface CreateContestantInput {
  contestantNumber: number;
  name: string;
  division: string;
  divisionId?: string | null | undefined;
  hometown?: string | undefined;
  heightCm?: number | undefined;
  bio?: string | undefined;
  advocacy?: string | undefined;
  avatarUrl: string;
  instagramUrl?: string | undefined;
  tiktokUrl?: string | undefined;
  facebookUrl?: string | undefined;
  categoryIds?: string[] | undefined;
  media?: Omit<ContestantMediaDto, "id" | "contestantId">[] | undefined;
}

export interface UpdateContestantInput {
  contestantNumber?: number | undefined;
  name?: string | undefined;
  division?: string | undefined;
  divisionId?: string | null | undefined;
  hometown?: string | undefined;
  heightCm?: number | null | undefined;
  bio?: string | undefined;
  advocacy?: string | undefined;
  avatarUrl?: string | undefined;
  instagramUrl?: string | undefined;
  tiktokUrl?: string | undefined;
  facebookUrl?: string | undefined;
  categoryIds?: string[] | undefined;
  media?: Omit<ContestantMediaDto, "id" | "contestantId">[] | undefined;
  status?: ContestantStatus | undefined;
}

export interface ContestantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContestantInput) => Promise<void>;
  categories: AwardCategoryDto[];
  divisions?: DynamicDivisionItem[] | DivisionDto[] | undefined;
  initialData?: ContestantDto | null | undefined;
}
