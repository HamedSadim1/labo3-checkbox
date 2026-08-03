import { useContext } from "react";
import { FilterContext, type Filter, FILTER_OPTIONS } from "@/context/FilterContext";

export type { Filter };
export { FILTER_OPTIONS };
export const useFilter = () => useContext(FilterContext);
