import { createContext } from "react";

export type Filter = "all" | "active" | "completed";

interface FilterContextType {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const FilterContext = createContext<FilterContextType>({
  filter: "all",
  setFilter: () => {},
});
