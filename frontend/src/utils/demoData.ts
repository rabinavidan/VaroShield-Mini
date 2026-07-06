import { api, FileItem } from "../api/client";
import { REAL_SOURCES } from "./fileMeta";

// Content mixes real trigger patterns the backend's classify_content() looks
// for (email/phone/card-number/keyword) with plain non-sensitive text, so a
// scan run afterward produces a realistic risky/safe split.
const DEMO_FILES: { name: string; content: string }[] = [
  { name: "customer_export", content: "Customer contact: jane.doe@example.com, phone 415-555-0199" },
  { name: "employee_ssn_list", content: "Employee SSN on file: 123-45-6789, 987-65-4321" },
  { name: "server_credentials", content: "admin password=Summer2024! do not share outside the team" },
  { name: "payment_batch", content: "Card on file: 4242424242424242, billed monthly" },
  { name: "sprint_notes", content: "Sprint planning notes for the Q3 roadmap discussion, no blockers" },
  { name: "release_notes", content: "Shipped 12 PRs this week, two bugfixes, one perf improvement" },
  { name: "brand_guidelines", content: "Logo usage, color palette, and typography guide for marketing" },
];
const DEMO_EXTENSIONS = ["csv", "pdf", "xlsx", "txt", "docx", "json", "log", "sql", "md"];
const DEMO_OWNERS = ["alice", "bob", "carla", "dev-team", "finance-team", "hr-team", "sre-oncall"];

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Creates one new file per real source (Google Drive, Salesforce, AWS, ...),
// each with randomized content/owner/extension/exposure, so every call visibly
// grows the dataset with realistic, scannable records. Returns the created
// files so callers can, e.g., surface them first in a per-file listing.
export async function createDemoFiles(): Promise<FileItem[]> {
  const created: FileItem[] = [];
  for (const src of REAL_SOURCES) {
    const pick = randomOf(DEMO_FILES);
    const ext = randomOf(DEMO_EXTENSIONS);
    const isPublicPick = Math.random() < 0.34;
    const file = await api.createFile({
      name: `${pick.name}_${Math.random().toString(36).slice(2, 6)}.${ext}`,
      content: pick.content,
      owner: randomOf(DEMO_OWNERS),
      source: src,
      is_public: isPublicPick,
    });
    if (!isPublicPick && Math.random() < 0.5) {
      await api.setPermission(file.id, "everyone", "read");
    }
    created.push(file);
  }
  return created;
}
