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

  /**
   * Получение всех данных с сервера GET запросом
   *
   * @returns Поток данных с сервера
   */
  getAllData(): Observable<Card[]>{
    return this.http.get<Card[]>(`${environment.apiURL}/cards`);
  }

  /**
   * Получение данных с сервера GET запросом отфильтрованных по атрибуту vote
   *
   * @param vote Значение атрибута vote
   *
   * @returns Поток данных с сервера
   */
  getData(vote: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiURL}/cards?vote=${vote}`);
  }

  /**
   * Отправка и обновление данных на сервере PATCH запросом
   *
   * @param cardID ID обновляемого объекта
   * @param newVote Новое значение vote
   */
  patchData(cardID: number, newVote: number): Observable<Card[]> {
    return this.http.patch<Card[]>(`${environment.apiURL}/cards/${cardID}`,
      {
        id: cardID,
        vote: newVote
      }
    );
  }
}
