"use client";

import SearchableSelectAILN, {
  type SearchableOption,
  type SearchableSelectAILNProps,
} from "./SearchableSelectAILN";

export type CreatableSelectAILNProps = SearchableSelectAILNProps & {
  onCreateOption: (query: string) => Promise<SearchableOption | null>;
};

// Creation is delegated to the caller's endpoint; this field never simulates a save.
export default function CreatableSelectAILN(props: CreatableSelectAILNProps) {
  return <SearchableSelectAILN {...props} />;
}
