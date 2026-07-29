import { useState, type ReactNode } from "react";
import { FilterContext, type Filter } from "./FilterContext";

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
