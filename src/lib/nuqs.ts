import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import { createSearchParamsCache, createSerializer } from "nuqs/server";

import { PAGINATION } from "@/constants/table";

export const searchParams = {
  page: parseAsInteger.withDefault(PAGINATION.PAGE_NUMBER),
  limit: parseAsInteger.withDefault(PAGINATION.ROWS_PER_PAGE),
  search: parseAsString,
  selectedIds: parseAsArrayOf(parseAsString),
  orderBy: parseAsString,
  sortBy: parseAsStringEnum(["asc", "desc"]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
