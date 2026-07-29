import { useContext } from "react";
import { FilterContext, type Filter } from "../context/FilterContext";

export type { Filter };
export const useFilter = () => useContext(FilterContext);
