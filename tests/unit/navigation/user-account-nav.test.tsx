import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { UserAccountNav } from "@/features/navigation/components/user-account-nav";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { UserSessionDto } from "@/features/auth/types";

const mockUser: UserSessionDto = {
  userId: "usr_test_123",
  name: "Maria Santos",
  email: "maria.santos@electa.ph",
  role: "ORGANIZER",
  avatarUrl: "https://example.com/avatars/maria.jpg",
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
};

const mockUserNoAvatar: UserSessionDto = {
  userId: "usr_test_456",
  name: "Juan Dela Cruz",
  email: "juan@electa.ph",
  role: "VOTER",
  avatarUrl: null,
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
};

describe("UserAccountNav Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  describe("Guest / Unauthenticated State", () => {
    it("renders 'Sign In' link pointing to /login when user is not authenticated", () => {
      render(<UserAccountNav user={null} />);

      const signInLink = screen.getByRole("link", { name: /sign in to your account/i });
      expect(signInLink).toBeDefined();
      expect(signInLink.getAttribute("href")).toBe("/login");
      expect(signInLink.className).toContain("rounded-none");
    });

    it("falls back to global auth store guest state when no user prop is passed", () => {
      render(<UserAccountNav />);

      const signInLink = screen.getByRole("link", { name: /sign in to your account/i });
      expect(signInLink).toBeDefined();
      expect(signInLink.getAttribute("href")).toBe("/login");
    });
  });

  describe("Authenticated State Trigger & Avatar", () => {
    it("renders profile trigger button with user name and circular avatar image when avatarUrl exists", () => {
      render(<UserAccountNav user={mockUser} />);

      const triggerBtn = screen.getByRole("button", {
        name: /user account menu for maria santos/i,
      });
      expect(triggerBtn).toBeDefined();
      expect(triggerBtn.getAttribute("aria-expanded")).toBe("false");
      expect(triggerBtn.getAttribute("aria-haspopup")).toBe("menu");

      const avatarImg = screen.getByAltText("Maria Santos's avatar");
      expect(avatarImg).toBeDefined();
      expect(avatarImg.getAttribute("src")).toBe("https://example.com/avatars/maria.jpg");
      expect(avatarImg.className).toContain("rounded-full");
      expect(avatarImg.className).toContain("aspect-square");
    });

    it("renders circular initials badge fallback when user has no avatar image", () => {
      render(<UserAccountNav user={mockUserNoAvatar} />);

      const initialsEl = screen.getByText("JD");
      expect(initialsEl).toBeDefined();
      expect(initialsEl.className).toContain("rounded-full");
      expect(initialsEl.className).toContain("aspect-square");
    });
  });

  describe("Dropdown Menu Interactions & Accessibility", () => {
    it("opens menu when trigger button is clicked, revealing user details and navigation links", () => {
      render(<UserAccountNav user={mockUser} />);

      const triggerBtn = screen.getByRole("button", {
        name: /user account menu for maria santos/i,
      });

      // Initially closed
      expect(screen.queryByRole("menu")).toBeNull();

      // Click to open
      fireEvent.click(triggerBtn);
      expect(triggerBtn.getAttribute("aria-expanded")).toBe("true");

      const menu = screen.getByRole("menu", { name: /user account actions/i });
      expect(menu).toBeDefined();
      expect(menu.className).toContain("rounded-none");

      // Verify user header
      expect(screen.getAllByText("Maria Santos")).toHaveLength(2);
      expect(screen.getByText("maria.santos@electa.ph")).toBeDefined();
      expect(screen.getByText("ORGANIZER")).toBeDefined();

      // Verify links
      const dashboardLink = screen.getByRole("menuitem", { name: /dashboard/i });
      expect(dashboardLink.getAttribute("href")).toBe("/dashboard");
      expect(dashboardLink.className).toContain("rounded-none");

      const createEventLink = screen.getByRole("menuitem", { name: /create event/i });
      expect(createEventLink.getAttribute("href")).toBe("/events/new");
      expect(createEventLink.className).toContain("rounded-none");

      // Verify sign out button
      const signOutBtn = screen.getByRole("menuitem", { name: /sign out/i });
      expect(signOutBtn).toBeDefined();
      expect(signOutBtn.className).toContain("rounded-none");
    });

    it("closes menu when Escape key is pressed", () => {
      render(<UserAccountNav user={mockUser} />);

      const triggerBtn = screen.getByRole("button", {
        name: /user account menu for maria santos/i,
      });
      fireEvent.click(triggerBtn);
      expect(screen.getByRole("menu")).toBeDefined();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("menu")).toBeNull();
      expect(triggerBtn.getAttribute("aria-expanded")).toBe("false");
    });

    it("closes menu when clicking outside container", () => {
      render(
        <div>
          <button type="button" data-testid="outside-el">Outside</button>
          <UserAccountNav user={mockUser} />
        </div>,
      );

      const triggerBtn = screen.getByRole("button", {
        name: /user account menu for maria santos/i,
      });
      fireEvent.click(triggerBtn);
      expect(screen.getByRole("menu")).toBeDefined();

      const outsideEl = screen.getByTestId("outside-el");
      fireEvent.mouseDown(outsideEl);
      expect(screen.queryByRole("menu")).toBeNull();
    });

    it("invokes onLogout when Sign Out button is clicked", async () => {
      const handleLogout = vi.fn().mockResolvedValue(undefined);
      render(<UserAccountNav user={mockUser} onLogout={handleLogout} />);

      const triggerBtn = screen.getByRole("button", {
        name: /user account menu for maria santos/i,
      });
      fireEvent.click(triggerBtn);

      const signOutBtn = screen.getByRole("menuitem", { name: /sign out/i });
      fireEvent.click(signOutBtn);

      expect(handleLogout).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
