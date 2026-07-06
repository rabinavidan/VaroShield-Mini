import { ComponentType } from "react";
import { FileItem } from "../api/client";
import {
  AwsIcon,
  BoxIcon,
  GitHubIcon,
  GoogleDriveIcon,
  MicrosoftTeamsIcon,
  OtherSourceIcon,
  SalesforceIcon,
  SlackIcon,
} from "../components/SourceIcons";

export type Exposure = "public" | "shared" | "private";

export function exposureOf(file: FileItem): Exposure {
  if (file.is_public) return "public";
  if (file.is_shared_with_everyone) return "shared";
  return "private";
}

export const EXPOSURE_LABEL: Record<Exposure, string> = {
  public: "public",
  shared: "shared",
  private: "private",
};

export interface SourceMeta {
  label: string;
  color: string;
  Icon: ComponentType<{ size?: number }>;
}

// Brand colors are each source's official hex (Simple Icons data / published
// brand guidelines), not invented — see components/SourceIcons.tsx.
export const SOURCE_META: Record<string, SourceMeta> = {
  google_drive: { label: "Google Drive", color: "#4285F4", Icon: GoogleDriveIcon },
  salesforce: { label: "Salesforce", color: "#00A1E0", Icon: SalesforceIcon },
  aws: { label: "AWS", color: "#232F3E", Icon: AwsIcon },
  box: { label: "Box", color: "#0061D5", Icon: BoxIcon },
  github: { label: "GitHub", color: "#181717", Icon: GitHubIcon },
  slack: { label: "Slack", color: "#4A154B", Icon: SlackIcon },
  teams: { label: "Microsoft Teams", color: "#6264A7", Icon: MicrosoftTeamsIcon },
  other: { label: "Other", color: "#667085", Icon: OtherSourceIcon },
};

export const SOURCES = Object.keys(SOURCE_META);
export const REAL_SOURCES = SOURCES.filter((s) => s !== "other");

export function sourceMeta(source: string): SourceMeta {
  return SOURCE_META[source] || SOURCE_META.other;
}

export function SourceBadge({ source }: { source: string }) {
  const meta = sourceMeta(source);
  const Icon = meta.Icon;
  return (
    <span className="source-badge">
      <span className="source-icon" style={{ color: meta.color }}>
        <Icon size={18} />
      </span>
      {meta.label}
    </span>
  );
}
