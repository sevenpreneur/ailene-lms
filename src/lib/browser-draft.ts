import dayjs from "dayjs";

/** Drafts belong to one account, program, and form version. Legacy unscoped drafts are never read. */
export function browserDraftKey(
  userId: string,
  projectId: string,
  form: string,
) {
  return `ailn-draft:v2:${encodeURIComponent(userId)}:${encodeURIComponent(projectId)}:${encodeURIComponent(form)}`;
}

export function readBrowserDraft<T>(
  storage: Pick<Storage, "getItem" | "removeItem">,
  key: string,
): T | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as { savedAt: string; value: T };
    if (
      !draft.savedAt ||
      !dayjs(draft.savedAt).isValid() ||
      dayjs().diff(dayjs(draft.savedAt), "day") >= 30
    ) {
      storage.removeItem(key);
      return null;
    }
    return draft.value ?? null;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeBrowserDraft<T>(
  storage: Pick<Storage, "setItem" | "removeItem">,
  key: string,
  value: T | null,
) {
  if (value === null) storage.removeItem(key);
  else
    storage.setItem(
      key,
      JSON.stringify({ savedAt: dayjs().toISOString(), value }),
    );
}
