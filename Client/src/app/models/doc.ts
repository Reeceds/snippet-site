export interface Doc {
  id?: number;
  title?: string;
  content?: string;
  creator?: string;
  dateCreated?: Date;
  lastUpdated?: Date;
  folderId?: number;
  appUserId?: string;
}
