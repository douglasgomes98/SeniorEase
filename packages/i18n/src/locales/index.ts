import type { Locale } from "../locale";
import type { MessageCatalog } from "../messages";
import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";

export const catalogs: Record<Locale, MessageCatalog> = { pt, en, es };
