import { Filter } from './filter';
import { SnippetFilter } from './snippetFilter';

export interface Snippet {
  id?: number;
  title?: string;
  content?: string;
  creator?: string;
  dateCreated?: Date;
  filters?: number[];
  newFilters?: Filter[];
  appUserId?: string;
  snippetFilters?: SnippetFilter[];
}
