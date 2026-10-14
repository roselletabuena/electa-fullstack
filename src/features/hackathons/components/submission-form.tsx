"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitProjectAction } from "../actions/submit-project";
import type { ProjectSubmissionDto } from "../types/submission";

export interface SubmissionFormProps {
  readonly eventSlug: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly availableTracks?: readonly string[] | undefined;
  readonly onSuccess?: ((submission: ProjectSubmissionDto) => void) | undefined;
}

interface MemberState {
  name: string;
  email: string;
  role: string;
}

export function SubmissionForm({
  eventSlug,
  isOpen,
  onClose,
  availableTracks = ["AI & Agents", "Web3", "Developer Tooling", "Public Goods"],
  onSuccess,
}: Readonly<SubmissionFormProps>): React.JSX.Element | null {
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [customTrack, setCustomTrack] = useState("");
  const [members, setMembers] = useState<MemberState[]>([
    { name: "", email: "", role: "Team Lead" },
  ]);

  // Validation & Result State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successSubmission, setSuccessSubmission] = useState<ProjectSubmissionDto | null>(null);

  if (!isOpen) return null;

  const toggleTrack = (trackName: string) => {
    setSelectedTracks((prev) =>
      prev.includes(trackName) ? prev.filter((t) => t !== trackName) : [...prev, trackName]
    );
    if (fieldErrors["trackTags"]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next["trackTags"];
        return next;
      });
    }
  };

  const addCustomTrack = () => {
    const trimmed = customTrack.trim();
    if (trimmed && !selectedTracks.includes(trimmed)) {
      if (selectedTracks.length >= 5) {
        setFieldErrors((prev) => ({ ...prev, trackTags: "Maximum 5 track tags allowed" }));
        return;
      }
      setSelectedTracks((prev) => [...prev, trimmed]);
      setCustomTrack("");
    }
  };

  const addMember = () => {
    if (members.length >= 10) return;
    setMembers((prev) => [...prev, { name: "", email: "", role: "Contributor" }]);
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof MemberState, value: string) => {
    setMembers((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (target) {
        copy[index] = { ...target, [field]: value };
      }
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errors["title"] = "Title must be at least 3 characters.";
    }
    if (!description.trim() || description.trim().length < 10) {
      errors["description"] = "Description must be at least 10 characters.";
    }
    if (!repositoryUrl.trim()) {
      errors["repositoryUrl"] = "Repository URL is required.";
    } else if (
      !repositoryUrl.startsWith("https://github.com/") &&
      !repositoryUrl.startsWith("https://gitlab.com/") &&
      !repositoryUrl.startsWith("https://www.github.com/") &&
      !repositoryUrl.startsWith("https://www.gitlab.com/")
    ) {
      errors["repositoryUrl"] = "Must be a valid GitHub or GitLab repository URL.";
    }
    if (selectedTracks.length === 0) {
      errors["trackTags"] = "Select at least one track tag.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Filter valid members
    const validMembers = members.filter((m) => m.name.trim() && m.email.trim());

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim(),
        repositoryUrl: repositoryUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        trackTags: selectedTracks,
        members: validMembers,
        links: [],
      };

      const result = await submitProjectAction(eventSlug, payload);

      if (!result.success) {
        setGeneralError(result.error || "Failed to submit project.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else if (result.data) {
        setSuccessSubmission(result.data);
        onSuccess?.(result.data);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog overlay"
        tabIndex={-1}
        className="fixed inset-0 cursor-default border-none bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-50 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-300 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X className="size-4" />
        </button>

        {successSubmission ? (
          <div className="py-8 text-center" data-testid="submission-success-banner">
            <div className="mx-auto flex size-12 items-center justify-center border border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-black text-slate-900 dark:text-white">
              Project Successfully Submitted!
            </h2>
            <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">
                {successSubmission.title}
              </strong>{" "}
              has been indexed in the hackathon exhibition grid.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                onClick={onClose}
                className="btn-primary rounded-none px-6 py-2"
              >
                Close & View in Exhibition
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
              <h2
                id="submission-form-title"
                className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white"
              >
                Submit Hackathon Project
              </h2>
              <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-300">
                Register your team&apos;s project deliverables, source code repository, and live demo links for judge review and demo day exhibition.
              </p>
            </div>

            {generalError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Project Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                >
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Voting Node"
                  aria-invalid={Boolean(fieldErrors["title"])}
                  className={`mt-1.5 ${fieldErrors["title"] ? "border-rose-500" : ""}`}
                />
                {fieldErrors["title"] && (
                  <p className="mt-1 font-sans text-[11px] text-rose-600 dark:text-rose-400">
                    {fieldErrors["title"]}
                  </p>
                )}
              </div>

              {/* Tagline */}
              <div>
                <label
                  htmlFor="tagline"
                  className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                >
                  Tagline / One-Liner
                </label>
                <Input
                  id="tagline"
                  name="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Decentralized zero-gas tally validator with zk-proof verification"
                  className="mt-1.5"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                >
                  Project Summary & Tech Stack <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem solved, architectural approach, and key technologies used..."
                  aria-invalid={Boolean(fieldErrors["description"])}
                  className={`mt-1.5 w-full rounded-none border border-slate-300 bg-white p-3 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden dark:border-slate-700 dark:bg-[#0d1424] dark:text-slate-100 ${
                    fieldErrors["description"] ? "border-rose-500" : ""
                  }`}
                />
                {fieldErrors["description"] && (
                  <p className="mt-1 font-sans text-[11px] text-rose-600 dark:text-rose-400">
                    {fieldErrors["description"]}
                  </p>
                )}
              </div>

              {/* Repository URL */}
              <div>
                <label
                  htmlFor="repositoryUrl"
                  className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                >
                  Git Repository URL <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="repositoryUrl"
                  name="repositoryUrl"
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/organization/repository"
                  aria-invalid={Boolean(fieldErrors["repositoryUrl"])}
                  className={`mt-1.5 ${fieldErrors["repositoryUrl"] ? "border-rose-500" : ""}`}
                />
                {fieldErrors["repositoryUrl"] && (
                  <p className="mt-1 font-sans text-[11px] text-rose-600 dark:text-rose-400">
                    {fieldErrors["repositoryUrl"]}
                  </p>
                )}
              </div>

              {/* Links Grid: Demo & Video */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="demoUrl"
                    className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                  >
                    Live Demo URL
                  </label>
                  <Input
                    id="demoUrl"
                    name="demoUrl"
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.myhackathonproject.io"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="videoUrl"
                    className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200"
                  >
                    Video Pitch URL (YouTube / Loom)
                  </label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Track Selection */}
              <div>
                <label className="block font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200">
                  Track Tags <span className="text-rose-500">*</span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTracks.map((track) => {
                    const isSelected = selectedTracks.includes(track);
                    return (
                      <button
                        type="button"
                        key={track}
                        onClick={() => toggleTrack(track)}
                        className={`rounded-none px-3 py-1 font-mono text-xs font-bold uppercase transition ${
                          isSelected
                            ? "border border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        }`}
                      >
                        {track}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Track Input */}
                <div className="mt-2 flex gap-2">
                  <Input
                    value={customTrack}
                    onChange={(e) => setCustomTrack(e.target.value)}
                    placeholder="Add custom track tag..."
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTrack();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addCustomTrack}
                    className="h-8 shrink-0 rounded-none px-3 text-[10px]"
                  >
                    Add Track
                  </Button>
                </div>

                {fieldErrors["trackTags"] && (
                  <p className="mt-1 font-sans text-[11px] text-rose-600 dark:text-rose-400">
                    {fieldErrors["trackTags"]}
                  </p>
                )}
              </div>

              {/* Team Members */}
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-200">
                    Team Members
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMember}
                    className="h-7 gap-1 text-[10px] text-sky-600 hover:text-sky-700 dark:text-sky-400"
                  >
                    <Plus className="size-3" />
                    <span>Add Member</span>
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {members.map((member, idx) => (
                    <div key={`member-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={member.name}
                        onChange={(e) => updateMember(idx, "name", e.target.value)}
                        placeholder="Member Name"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(idx, "email", e.target.value)}
                        placeholder="email@example.com"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={member.role}
                        onChange={(e) => updateMember(idx, "role", e.target.value)}
                        placeholder="Role"
                        className="h-8 w-28 shrink-0 text-xs"
                      />
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          aria-label="Remove member"
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className="rounded-none px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary rounded-none px-6 py-2 text-xs font-extrabold uppercase tracking-widest"
                >
                  {isPending ? "Submitting..." : "Submit Project"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
