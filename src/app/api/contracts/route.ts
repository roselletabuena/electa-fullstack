import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import {
  getApiContracts,
  getRouteContract,
  type RouteJsonContract,
  type HttpMethod,
} from "@/lib/api/contracts";

export interface ContractsResponseDto {
  version: string;
  totalContracts: number;
  contracts: RouteJsonContract[];
}

export function GET(
  request: NextRequest,
): NextResponse<ApiResponse<ContractsResponseDto | RouteJsonContract>> {
  try {
    const { searchParams } = new URL(request.url);
    const targetPath = searchParams.get("path");
    const targetMethod = searchParams.get("method") as HttpMethod | null;

    if (targetPath) {
      const contract = getRouteContract(targetPath, targetMethod ?? undefined);
      if (contract) {
        return apiSuccess(contract, 200);
      }

      const methodSuffix = targetMethod ? ` and method '${targetMethod}'` : "";
      return apiError(`Contract not found for path '${targetPath}'${methodSuffix}`, 404);
    }

    const allContracts = getApiContracts();

    return apiSuccess(
      {
        version: "1.0.0",
        totalContracts: allContracts.length,
        contracts: allContracts,
      },
      200,
    );
  } catch (error) {
    console.error("Failed to retrieve API contracts:", error);
    return apiError("Internal server error while resolving route contracts", 500);
  }
}
