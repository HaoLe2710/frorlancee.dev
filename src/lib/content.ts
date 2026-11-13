import { getEmDashCollection, sanitizeHref } from "emdash";

export type PublicContactLink = {
  type: string;
  label: string;
  value?: string;
  href: string;
  sortOrder: number;
};

export function safeHref(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const safe = sanitizeHref(value.trim());
  return safe === "#" ? undefined : safe;
}

export async function getVisibleContactLinks(): Promise<PublicContactLink[]> {
  const { entries, error } = await getEmDashCollection("contact_links", {
    limit: 50,
    orderBy: { sort_order: "asc" },
  });

  if (error) {
    console.error("Unable to load public contact links.");
    return [];
  }

  return entries.filter(({ data }) => data.visible !== false).flatMap(({ data }) => {
    const href = safeHref(data.url);
    const type = data.type ?? "website";
    const isValidType =
      type === "email"
        ? href?.startsWith("mailto:")
        : href && (href.startsWith("https://") || href.startsWith("http://") || href.startsWith("/"));

    if (!href || !isValidType || !data.label?.trim()) return [];

    return [{
      type,
      label: data.label.trim(),
      value: data.value?.trim() || undefined,
      href,
      sortOrder: data.sort_order ?? 100,
    }];
  });
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://");
}

export function safeExternalUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

export function formatDate(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(parsed);
}
