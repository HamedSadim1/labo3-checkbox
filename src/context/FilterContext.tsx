import { createContext, useState, type ReactNode } from "react";

export type Filter = "all" | "active" | "completed";

interface FilterContextType {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const FilterContext = createContext<FilterContextType>({
  filter: "all",
  setFilter: () => {},
});

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
