import { apiSuccess } from "@/lib/api/response";
import { DEFAULT_SITE_HEADER_CONFIG } from "@/features/navigation/utils/nav-config";
import type { SiteHeaderConfig } from "@/features/navigation/types";

export function GET() {
  return apiSuccess<SiteHeaderConfig>(DEFAULT_SITE_HEADER_CONFIG);
}
