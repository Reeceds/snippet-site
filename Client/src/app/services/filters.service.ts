import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Filter } from '../models/filter';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient) {}

  getFilters(): Observable<Filter[]> | undefined {
    return this.http.get<Filter[]>(`${this.url}filters`);
  }

  createFilter(filter: Filter): Observable<Filter> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const filterData = JSON.stringify(filter);

    return this.http.post<Filter>(
      `${this.url}filters/create`,
      filterData,
      httpOptions
    );
  }

  // createFilterList(filtersArr: Filter[]): Observable<Filter[]> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       responseType: 'text/plain',
  //     }),
  //   };

  //   const filterData = JSON.stringify(filtersArr);

  //   return this.http.post<Filter[]>(
  //     `${this.url}filters/create/list`,
  //     filterData,
  //     httpOptions
  //   );
  // }

  editFilter(editedFIlter: Filter) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const filterData = JSON.stringify(editedFIlter);

    return this.http.post<Filter>(
      `${this.url}filters/edit`,
      filterData,
      httpOptions
    );
  }

  deleteFitler(id: number) {
    return this.http.delete(`${this.url}filters/delete/${id}`);
  }
}
