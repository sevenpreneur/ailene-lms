"use client";

import { useEffect, useRef, useState } from "react";
import SelectControlAILN, {
  type OptionType,
  type SelectControlAILNProps,
} from "./SelectControlAILN";

export type SearchableOption = OptionType;
export interface LoadOptionsResult {
  options: SearchableOption[];
  hasMore: boolean;
}

export interface SearchableSelectAILNProps extends Omit<
  SelectControlAILNProps,
  "value" | "onChange" | "onCreateOption" | "options" | "loadOptions"
> {
  value: SearchableOption | null;
  onChange: (option: SearchableOption | null) => void;
  options?: SearchableOption[];
  defaultOptions?: SearchableOption[];
  loadOptions?: (query: string, page: number) => Promise<LoadOptionsResult>;
  debounceMs?: number;
  onCreateOption?: (query: string) => Promise<SearchableOption | null>;
}

export default function SearchableSelectAILN({
  options,
  defaultOptions,
  loadOptions,
  debounceMs = 250,
  onCreateOption,
  onChange,
  disabled,
  errorMessage,
  placeholder = "Cari atau pilih...",
  ...rest
}: SearchableSelectAILNProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<LoadOptionsResult>({
    options: defaultOptions ?? [],
    hasMore: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [creating, setCreating] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!open || disabled || !loadOptions) return;
    const current = ++requestId.current;
    const timer = setTimeout(
      async () => {
        setLoading(true);
        setLoadError("");
        try {
          const result = await loadOptions(query, page);
          if (current !== requestId.current) return;
          setLoaded((previous) => ({
            options:
              page === 1
                ? result.options
                : [
                    ...previous.options,
                    ...result.options.filter(
                      (item) =>
                        !previous.options.some(
                          (old) => old.value === item.value,
                        ),
                    ),
                  ],
            hasMore: result.hasMore,
          }));
        } catch {
          if (current === requestId.current)
            setLoadError(
              "Pilihan belum dapat dimuat. Tutup lalu buka kembali untuk mencoba lagi.",
            );
        } finally {
          if (current === requestId.current) setLoading(false);
        }
      },
      page === 1 ? debounceMs : 0,
    );
    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
  }, [query, page, open, disabled, loadOptions, debounceMs]);

  async function handleCreate(value: string) {
    if (!onCreateOption || !value.trim() || creating) return;
    setCreating(true);
    setLoadError("");
    try {
      const created = await onCreateOption(value.trim());
      if (created) {
        onChange(created);
        setQuery("");
        setPage(1);
      }
    } catch {
      setLoadError("Pilihan belum dapat ditambahkan. Silakan coba lagi.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <SelectControlAILN
      {...rest}
      placeholder={placeholder}
      disabled={disabled || creating}
      errorMessage={errorMessage || loadError}
      options={loadOptions ? loaded.options : (options ?? defaultOptions ?? [])}
      isLoading={loading || creating}
      isSearchable
      isClearable
      inputValue={query}
      filterOption={loadOptions ? null : undefined}
      onInputChange={(value, meta) => {
        if (meta.action === "input-change") {
          setQuery(value);
          setPage(1);
        }
      }}
      onChange={(option) => {
        onChange(option);
        setQuery("");
        setPage(1);
      }}
      onMenuOpen={() => {
        setOpen(true);
        rest.onMenuOpen?.();
      }}
      onMenuClose={() => {
        setOpen(false);
        setQuery("");
        setPage(1);
        rest.onMenuClose?.();
      }}
      onMenuScrollToBottom={() => {
        if (loadOptions && loaded.hasMore && !loading && !loadError)
          setPage((previous) => previous + 1);
      }}
      onCreateOption={onCreateOption ? handleCreate : undefined}
    />
  );
}
