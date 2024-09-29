import { Filter } from './filter';
import { SnippetFilter } from './snippetFilter';

export interface Snippet {
  id?: number;
  title?: string;
  content?: string;
  notes?: string;
  creator?: string;
  dateCreated?: Date;
  lastUpdated?: Date;
  filters?: number[];
  newFilters?: Filter[];
  appUserId?: string;
  snippetFilters?: SnippetFilter[];
}
