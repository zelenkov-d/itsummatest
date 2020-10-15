import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './card';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  getAllData() {
    return this.http.get<Card[]>(`${environment.apiURL}/cards`);
  }

  getData(vote: number) {
    return this.http.get<Card[]>(`${environment.apiURL}/cards?vote=${vote}`);
  }

  patchData(cardID: number, newVote: number) {
    return this.http.patch<Card[]>(`${environment.apiURL}/cards/${cardID}`, 
      {
        id: cardID,
        vote: newVote
      }
    );
  }

}
