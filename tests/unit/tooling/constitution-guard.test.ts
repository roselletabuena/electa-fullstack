import { describe, it, expect } from "vitest";
import {
  findConstitutionViolations,
  shouldCheckFile,
} from "../../../.agents/scripts/check-constitution.mjs";

describe("Constitution Guard (.agents/scripts/check-constitution.mjs)", () => {
  it("detects un-awaited cookies() invocation (Constitution §II)", () => {
    const snippet = `
      import { cookies } from "next/headers";
      export async function testAction() {
        const cookieStore = cookies();
        return cookieStore.get("token");
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/actions/test.ts");
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe("UN_AWAITED_NEXT_REQUEST_API");
    expect(violations[0]?.message).toContain("Next.js 16 request API `cookies()` invoked without `await`");
  });

  it("detects un-awaited headers() invocation (Constitution §II)", () => {
    const snippet = `
      import { headers } from "next/headers";
      export async function testAction() {
        const h = headers();
        return h.get("authorization");
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/actions/test.ts");
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe("UN_AWAITED_NEXT_REQUEST_API");
    expect(violations[0]?.message).toContain("Next.js 16 request API `headers()` invoked without `await`");
  });

  it("allows properly awaited cookies() and headers()", () => {
    const snippet = `
      import { cookies, headers } from "next/headers";
      export async function testAction() {
        const cookieStore = await cookies();
        const reqHeaders = await headers();
        return { cookie: cookieStore.get("token"), auth: reqHeaders.get("auth") };
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/actions/test.ts");
    expect(violations).toHaveLength(0);
  });

  it("detects synchronous params and searchParams property access in App Router (Constitution §II)", () => {
    const snippet = `
      export default async function EventPage(props: { params: { slug: string } }) {
        const slug = props.params.slug;
        return <div>{slug}</div>;
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/app/events/[slug]/page.tsx");
    expect(violations.some((v) => v.type === "UN_AWAITED_PARAMS_ACCESS")).toBe(true);
  });

  it("allows awaited params in App Router pages", () => {
    const snippet = `
      export default async function EventPage(props: { params: Promise<{ slug: string }> }) {
        const { slug } = await props.params;
        return <div>{slug}</div>;
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/app/events/[slug]/page.tsx");
    expect(violations).toHaveLength(0);
  });

  it("detects prohibited any keyword (Constitution §I)", () => {
    const snippet = `
      const badData: any = { foo: "bar" };
      const casted = badData as any;
    `;

    const violations = findConstitutionViolations(snippet, "src/lib/test.ts");
    expect(violations).toHaveLength(2);
    expect(violations[0]?.type).toBe("PROHIBITED_ANY_TYPE");
    expect(violations[1]?.type).toBe("PROHIBITED_ANY_TYPE");
  });

  it("detects non-null assertion operator ! (Constitution §I)", () => {
    const snippet = `
      const user = getUser();
      const email = user!.email;
    `;

    const violations = findConstitutionViolations(snippet, "src/lib/test.ts");
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe("PROHIBITED_NON_NULL_ASSERTION");
  });

  it("flags route handlers returning raw NextResponse.json without ApiResponse envelope", () => {
    const snippet = `
      import { NextResponse } from "next/server";
      export async function GET() {
        return NextResponse.json({ foo: "bar" });
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/app/api/polls/route.ts");
    expect(violations.some((v) => v.type === "ROUTE_HANDLER_ENVELOPE")).toBe(true);
  });

  it("allows route handlers using apiSuccess or apiError envelopes", () => {
    const snippet = `
      import { apiSuccess, apiError } from "@/lib/api/response";
      export async function GET() {
        return apiSuccess({ count: 42 });
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/app/api/polls/route.ts");
    expect(violations).toHaveLength(0);
  });

  it("exempts external webhooks from internal ApiResponse envelope", () => {
    const snippet = `
      import { NextResponse } from "next/server";
      export async function POST() {
        return NextResponse.json({ received: true });
      }
    `;

    const violations = findConstitutionViolations(snippet, "src/app/api/webhooks/paymongo/route.ts");
    expect(violations).toHaveLength(0);
  });

  it("respects // constitution-ignore comments", () => {
    const snippet = `
      // constitution-ignore
      const anyData: any = "legacy";
    `;

    const violations = findConstitutionViolations(snippet, "src/lib/test.ts");
    expect(violations).toHaveLength(0);
  });

  it("validates shouldCheckFile filters", () => {
    const workspaceRoot = process.cwd();
    expect(shouldCheckFile("node_modules/pkg/index.ts", workspaceRoot)).toBe(false);
    expect(shouldCheckFile(".agents/scripts/foo.ts", workspaceRoot)).toBe(false);
    expect(shouldCheckFile("tests/unit/foo.test.ts", workspaceRoot)).toBe(false);
    expect(shouldCheckFile("src/env.ts", workspaceRoot)).toBe(true); // .ts file
  });
});
