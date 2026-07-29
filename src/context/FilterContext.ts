import { createContext } from "react";

export type Filter = "all" | "active" | "completed";

export const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

interface FilterContextType {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const FilterContext = createContext<FilterContextType>({
  filter: "all",
  setFilter: () => {},
});
