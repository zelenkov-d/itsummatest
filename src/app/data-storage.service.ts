import { Injectable } from '@angular/core';
import { Card } from './card';
import { OpenCard } from './open-card';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  private cardsSubject: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>([]);
  public cardsObservable: Observable<Card[]> = this.cardsSubject.asObservable();

  private cardsFavSubject: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>([]);
  public cardsFavObservable: Observable<Card[]> = this.cardsFavSubject.asObservable();

  private cardsBanSubject: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>([]);
  public cardsBanObservable: Observable<Card[]> = this.cardsBanSubject.asObservable();

  private cards: Card[];
  private partCards: Card[];
  private openCards: OpenCard[];

  private banCards: Card[];
  private partBanCards: Card[];
  private openBanCards: OpenCard[];

  private favCards: Card[];
  private partFavCards: Card[];
  private openFavCards: OpenCard[];

  private openCardsStorageKey = 'openCards';
  private openFavCardsStorageKey = 'openFavCards';
  private openBanCardsStorageKey = 'openBanCards';
  private hashIDStorageKey = 'hashID';

  private loadCount: number;
  private hashID: number;
  private maxLoadCount: number;

  constructor(private httpService: HttpService) {
    this.loadCount = 10;
    this.cards = [];
    this.partCards = [];
    this.openCards = [];
    this.favCards = [];
    this.partFavCards = [];
    this.openFavCards = [];
    this.banCards = [];
    this.partBanCards = [];
    this.openBanCards = [];
    this.hashID = 0;
    this.maxLoadCount = this.hashID + this.loadCount;
  }

  /**
   * Чтение данных с LocalStorage браузера
   */
  public loadFromLocalStorage(): void {
    if (this.checkLocalStorage(this.hashIDStorageKey)) {
      this.hashID = +this.getDataFromLoacalStorage(this.hashIDStorageKey).toString();
    }
    if (this.checkLocalStorage(this.openCardsStorageKey)) {
      this.openCards = this.getDataFromLoacalStorage(this.openCardsStorageKey);
    }
    if (this.checkLocalStorage(this.openFavCardsStorageKey)) {
      this.openFavCards = this.getDataFromLoacalStorage(this.openFavCardsStorageKey);
    }
    if (this.checkLocalStorage(this.openBanCardsStorageKey)) {
      this.openBanCards = this.getDataFromLoacalStorage(this.openBanCardsStorageKey);
    }
  }

  /**
   * Инициализация данных о карточках и обновление значений открытых карточек для списка карточек
   *
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  public initData(voteID: number): void {
    console.log(voteID);
    const storageKey = this.getStorageKey(voteID);
    if (this.checkLocalStorage(storageKey)) {
      this.httpService.getData(voteID).subscribe((data: Card[]) => {
        this.initCardsWithLocalData(data, voteID);
        const openCards = this.getOpenCards(voteID);
        this.setDataToLoacalStorage(storageKey, openCards);
      });
    } else {
      this.httpService.getData(voteID).subscribe((data: Card[]) => {
        this.initNewCards(data, voteID);
        const openCards = this.getOpenCards(voteID);
        this.setDataToLoacalStorage(storageKey, openCards);
      });
    }
  }

  /**
   * Получение потока данных о карточках для списка
   *
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   *
   * @returns Поток данных с карточками
   */
  public getData(voteID: number): Observable<Card[]> {
    if (voteID === 0) {
      return this.cardsObservable;
    } else if (voteID === 1) {
      return this.cardsFavObservable;
    } else if (voteID === 2) {
      return this.cardsBanObservable;
    }
  }

  /**
   * Инициализация массива карточек со считыванием состояний открытости с LocalStorage
   *
   * @param data Входной массив карточек
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private initCardsWithLocalData(data: Card[], voteID: number): void {
    const newOpenCards: OpenCard[] = [];
    const openCards = this.getOpenCards(voteID);
    data.forEach((element: Card, index: number) => {
      const card: Card = new Card(element);
      const targetOpenCard: OpenCard = openCards.find(
        (openCard: OpenCard) => card.id === openCard.id);
      if (targetOpenCard) {
        card.open = targetOpenCard.open;
        newOpenCards.push(targetOpenCard);
      } else {
        card.open = false;
        newOpenCards.push(new OpenCard(card.id));
      }
      this.pushCards(card, index, data, voteID);
    });
    this.setOpenCards(newOpenCards, voteID);
  }

  /**
   * Инициализация массива карточек при отстувии данных в LocalStorage
   *
   * @param data Входной массив карточек
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private initNewCards(data: Card[], voteID: number): void {
    const newOpenCards: OpenCard[] = [];
    data.forEach((value: Card, index: number) => {
      const card: Card = new Card(value);
      newOpenCards.push(new OpenCard(card.id));
      this.pushCards(card, index, data, voteID);
    });
    this.setOpenCards(newOpenCards, voteID);
  }

  /**
   * Формирование частей карточек для передачи в поток данных передаваемый компонентам
   *
   * @param card Карточка
   * @param index Идентификатор карточки в массиве
   * @param data Массив карточек
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private pushCards(card: Card, index: number, data: Card[], voteID: number): void {
    const cards = this.getCards(voteID);
    const partCards = this.getPartCards(voteID);
    cards.push(card);
    if (index < this.maxLoadCount && index < data.length) {
      partCards.push(card);
      if (index === data.length - 1) {
        this.pushDataToStream(partCards, voteID);
      }
    } else {
      if (index === this.maxLoadCount) {
        this.pushDataToStream(partCards, voteID);
      }
    }
  }

  /**
   * Передача массива карточек в поток
   *
   * @param data Массив карточек
   * @param voteID  ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private pushDataToStream(data: Card[], voteID: number): void {
    if (voteID === 0) {
      this.cardsSubject.next(data);
    } else if (voteID === 1) {
      this.cardsFavSubject.next(data);
    } else if (voteID === 2) {
      this.cardsBanSubject.next(data);
    }
  }

  /**
   * Проверка наличияя данных в LocalStorage по ключу
   *
   * @param key Ключ
   *
   * @returns true - если данные есть, иначе false
   */
  private checkLocalStorage(key: string): boolean {
    if (this.getDataFromLoacalStorage(key)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Получение данных из LocalStorage по ключу
   *
   * @param key Ключ
   *
   * @returns Массив данных
   */
  private getDataFromLoacalStorage(key: string): any[] {
    return JSON.parse(localStorage.getItem(key));
  }

  /**
   * Запись данных из LocalStorage по ключу
   *
   * @param key Ключ
   * @param value Данные
   */
  private setDataToLoacalStorage(key: string, value: any): void {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Подгрузка части данных
   *
   * @param id ID последнего элемента предыдущей части данных
   * @param voteID ID списка карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  public loadPartData(id: number, voteID: number): void {
    const cards = this.getCards(voteID);
    const partCards = this.getPartCards(voteID);
    const startIndex = id + 1;
    let endIndex = startIndex + this.loadCount;
    if (endIndex >= cards.length) {
      endIndex = cards.length - 1;
    }
    for (let i = startIndex; i < endIndex; i++) {
      partCards.push(cards[i]);
    }
  }

  /**
   * Обновление значения голоса
   *
   * @param id ID объекта, чей голос обновляется
   * @param vote ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private sendDataToServer(id: number, vote: number): void {
    this.httpService.patchData(id, vote).subscribe(
      data => {
        console.log('PATCH Request is successful ', data);
      },
      error => {
        console.log('Error', error);
      }
    );
  }

  /**
   * Очистка массиово карточек для всплывающих окон
   */
  public clearExtraCards(): void {
    this.favCards = [];
    this.partFavCards = [];
    this.banCards = [];
    this.partBanCards = [];
  }

  /**
   * Удаление карточки из потока
   *
   * @param id ID карточки
   * @param cards Массив карточек
   * @param vote ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private removeFromPartCards(id: number, cards: Card[], vote: number): void {
    cards = cards.filter((item: Card) => item.id !== id);
    this.setPartCards(cards, vote);
    this.pushDataToStream(cards, vote);
  }

  /**
   * Перенос карточки из основного списка в список избранных
   *
   * @param id ID карточки
   */
  public setToFavListFromMain(id: number): void {
    this.sendDataToServer(id, 1);
    this.openFavCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
    this.removeFromPartCards(id, this.partCards, 0);
    this.openCards = this.openCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
  }

  /**
   * Перенос карточки из основного списка в черный список
   *
   * @param id ID карточки
   */
  public setToBanListFromMain(id: number): void {
    this.sendDataToServer(id, 2);
    this.openBanCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
    this.removeFromPartCards(id, this.partCards, 0);
    this.openCards = this.openCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
  }

  /**
   * Перенос карточки из черного списка в список избранных
   *
   * @param id ID карточки
   */
  public setToFavListFromBan(id: number): void {
    this.sendDataToServer(id, 1);
    this.openFavCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
    this.removeFromPartCards(id, this.partBanCards, 2);
    this.openBanCards = this.openBanCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
  }

  /**
   * Перенос карточки из черного списка в основной
   *
   * @param id ID карточки
   */
  public setToMainListFromBan(id: number): void {
    this.sendDataToServer(id, 0);
    this.addToMainList(id, this.partBanCards);
    this.openCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
    this.removeFromPartCards(id, this.partBanCards, 2);
    this.openBanCards = this.openBanCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
  }

  /**
   * Перенос карточки из списка избранных в черный список
   *
   * @param id ID карточки
   */
  public setToBanListFromFav(id: number): void {
    this.sendDataToServer(id, 2);
    this.openBanCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
    this.removeFromPartCards(id, this.partFavCards, 1);
    this.openFavCards = this.openFavCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
  }

  /**
   * Перенос карточки из списка избранных в основной список
   *
   * @param id ID карточки
   */
  public setToMainListFromFav(id: number): void {
    this.sendDataToServer(id, 0);
    this.addToMainList(id, this.partFavCards);
    this.openCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
    this.removeFromPartCards(id, this.partFavCards, 1);
    this.openFavCards = this.openFavCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
  }

  /**
   * Добавление карточки в основной поток
   *
   * @param id ID картоски
   * @param fromList Список карточек из которого перенится карточка
   */
  private addToMainList(id: number, fromList: Card[]): void {
    const targetCard = fromList.find(card => card.id === id);
    this.partCards.push(targetCard);
  }

  /**
   * Установка hash ID в LocalStorage
   *
   * @param id hash ID
   */
  public setCurrentIDtoStorage(id: number): void {
    this.setDataToLoacalStorage(this.hashIDStorageKey, id);
  }

  /**
   * Изменения значения открытости карточки
   *
   * @param id ID карточки
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  public async changeOpenCardParam(id: number, voteID: number): Promise<any> {
    const storageKey = this.getStorageKey(voteID);
    const openCards = this.getOpenCards(voteID);
    const changeOpenCard = openCards.find((openCard: OpenCard) => id === openCard.id);
    changeOpenCard.open = !changeOpenCard.open;
    this.setDataToLoacalStorage(storageKey, openCards);
  }

  /**
   * Получение ключа LocalStorage для хранения значений открытых карточек для списка
   *
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   *
   * @returns Ключ
   */
  private getStorageKey(voteID: number): string {
    if (voteID === 0) {
      return this.openCardsStorageKey;
    } else if (voteID === 1) {
      return this.openFavCardsStorageKey;
    } else if (voteID === 2) {
      return this.openBanCardsStorageKey;
    }
  }

  /**
   * Получение массива заначений открытых карточек для списка
   *
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   *
   * @returns Массив значений
   */
  private getOpenCards(voteID: number): OpenCard[] {
    if (voteID === 0) {
      return this.openCards;
    } else if (voteID === 1) {
      return this.openFavCards;
    } else if (voteID === 2) {
      return this.openBanCards;
    }
  }

  /**
   * Получение массива части карточек отображаемых в списке
   *
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   *
   * @returns Массив карточек
   */
  private getPartCards(voteID: number): Card[] {
    if (voteID === 0) {
      return this.partCards;
    } else if (voteID === 1) {
      return this.partFavCards;
    } else if (voteID === 2) {
      return this.partBanCards;
    }
  }

  /**
   * Получение массива карточек списка
   *
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   *
   * @returns Массив карточек
   */
  private getCards(voteID: number): Card[] {
    if (voteID === 0) {
      return this.cards;
    } else if (voteID === 1) {
      return this.favCards;
    } else if (voteID === 2) {
      return this.banCards;
    }
  }

  /**
   * Установка массива заначений открытых карточек для списка
   *
   * @param newCards Массив новых значений
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private setOpenCards(newCards: OpenCard[], voteID: number): void {
    if (voteID === 0) {
      this.openCards = newCards;
    } else if (voteID === 1) {
      this.openFavCards = newCards;
    } else if (voteID === 2) {
      this.openBanCards = newCards;
    }
  }

  /**
   * Установка массива части карточек отображаемых в списке
   *
   * @param newCards Массив новых карточек
   * @param voteID ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  private setPartCards(newCards: Card[], voteID: number): void {
    if (voteID === 0) {
      this.partCards = newCards;
    } else if (voteID === 1) {
      this.partFavCards = newCards;
    } else if (voteID === 2) {
      this.partBanCards = newCards;
    }
  }
}
