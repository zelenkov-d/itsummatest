import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './card';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  getAllData(): Observable<Card[]>{
    return this.http.get<Card[]>(`${environment.apiURL}/cards`);
  }

  getData(vote: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiURL}/cards?vote=${vote}`);
  }

  patchData(cardID: number, newVote: number): Observable<Card[]> {
    return this.http.patch<Card[]>(`${environment.apiURL}/cards/${cardID}`,
      {
        id: cardID,
        vote: newVote
      }
    );
  }

}
