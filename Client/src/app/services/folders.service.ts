import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Folder } from '../models/folder';

@Injectable({
  providedIn: 'root',
})
export class FoldersService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient) {}

  getFoldersList(): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${this.url}folders`);
  }

  getFolder(id: number): Observable<Folder> {
    return this.http.get<Folder>(`${this.url}folders/folder/${id}`);
  }

  createFolder(newFolder: Folder): Observable<Folder> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const folderData = JSON.stringify(newFolder);

    return this.http.post<Folder>(
      `${this.url}folders/create`,
      folderData,
      httpOptions
    );
  }

  editFolder(editedFolder: Folder): Observable<Folder> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const folderData = JSON.stringify(editedFolder);

    return this.http.post<Folder>(
      `${this.url}folders/edit`,
      folderData,
      httpOptions
    );
  }

  deleteFolder(id: number) {
    return this.http.delete(`${this.url}folders/delete/${id}`);
  }
}
