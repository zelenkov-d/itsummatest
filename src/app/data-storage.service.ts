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

  public getData(voteID: number): Observable<Card[]> {
    if (voteID === 0) {
      return this.cardsObservable;
    } else if (voteID === 1) {
      return this.cardsFavObservable;
    } else if (voteID === 2) {
      return this.cardsBanObservable;
    }
  }

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

  private initNewCards(data: Card[], voteID: number): void {
    const newOpenCards: OpenCard[] = [];
    data.forEach((value: Card, index: number) => {
      const card: Card = new Card(value);
      newOpenCards.push(new OpenCard(card.id));
      this.pushCards(card, index, data, voteID);
    });
    this.setOpenCards(newOpenCards, voteID);
  }

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

  private pushDataToStream(data: Card[], voteID: number): void {
    if (voteID === 0) {
      this.cardsSubject.next(data);
    } else if (voteID === 1) {
      this.cardsFavSubject.next(data);
    } else if (voteID === 2) {
      this.cardsBanSubject.next(data);
    }
  }

  private checkLocalStorage(key: string): boolean {
    if (this.getDataFromLoacalStorage(key)) {
      return true;
    } else {
      return false;
    }
  }

  private getDataFromLoacalStorage(key: string): any[] {
    return JSON.parse(localStorage.getItem(key));
  }

  private setDataToLoacalStorage(key: string, value: any): void {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(value));
  }

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

  public clearExtraCards(): void {
    this.favCards = [];
    this.partFavCards = [];
    this.banCards = [];
    this.partBanCards = [];
  }

  private removeFromPartCards(id: number, cards: Card[], vote: number): void {
    cards = cards.filter((item: Card) => item.id !== id);
    this.setPartCards(cards, vote);
    this.pushDataToStream(cards, vote);
  }

  public setToFavListFromMain(id: number): void {
    this.sendDataToServer(id, 1);
    this.openFavCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
    this.removeFromPartCards(id, this.partCards, 0);
    this.openCards = this.openCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
  }

  public setToBanListFromMain(id: number): void {
    this.sendDataToServer(id, 2);
    this.openBanCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
    this.removeFromPartCards(id, this.partCards, 0);
    this.openCards = this.openCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
  }

  public setToFavListFromBan(id: number): void {
    this.sendDataToServer(id, 1);
    this.openFavCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
    this.removeFromPartCards(id, this.partBanCards, 2);
    this.openBanCards = this.openBanCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
  }

  public setToMainListFromBan(id: number): void {
    this.sendDataToServer(id, 0);
    this.addToMainList(id, this.partBanCards);
    this.openCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
    this.removeFromPartCards(id, this.partBanCards, 2);
    this.openBanCards = this.openBanCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
  }

  public setToBanListFromFav(id: number): void {
    this.sendDataToServer(id, 2);
    this.openBanCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openBanCardsStorageKey, this.openBanCards);
    this.removeFromPartCards(id, this.partFavCards, 1);
    this.openFavCards = this.openFavCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
  }

  public setToMainListFromFav(id: number): void {
    this.sendDataToServer(id, 0);
    this.addToMainList(id, this.partFavCards);
    this.openCards.push(new OpenCard(id));
    this.setDataToLoacalStorage(this.openCardsStorageKey, this.openCards);
    this.removeFromPartCards(id, this.partFavCards, 1);
    this.openFavCards = this.openFavCards.filter((item: OpenCard) => item.id !== id);
    this.setDataToLoacalStorage(this.openFavCardsStorageKey, this.openFavCards);
  }

  private addToMainList(id: number, fromList: Card[]): void {
    const targetCard = fromList.find(card => card.id === id);
    this.partCards.push(targetCard);
  }

  public setCurrentIDtoStorage(id: number): void {
    this.setDataToLoacalStorage(this.hashIDStorageKey, id);
  }

  public async changeOpenCardParam(id: number, voteID: number): Promise<any> {
    const storageKey = this.getStorageKey(voteID);
    const openCards = this.getOpenCards(voteID);
    const changeOpenCard = openCards.find((openCard: OpenCard) => id === openCard.id);
    changeOpenCard.open = !changeOpenCard.open;
    this.setDataToLoacalStorage(storageKey, openCards);
  }

  private getStorageKey(voteID: number): string {
    if (voteID === 0) {
      return this.openCardsStorageKey;
    } else if (voteID === 1) {
      return this.openFavCardsStorageKey;
    } else if (voteID === 2) {
      return this.openBanCardsStorageKey;
    }
  }

  private getOpenCards(voteID: number): OpenCard[] {
    if (voteID === 0) {
      return this.openCards;
    } else if (voteID === 1) {
      return this.openFavCards;
    } else if (voteID === 2) {
      return this.openBanCards;
    }
  }

  private getPartCards(voteID: number): Card[] {
    if (voteID === 0) {
      return this.partCards;
    } else if (voteID === 1) {
      return this.partFavCards;
    } else if (voteID === 2) {
      return this.partBanCards;
    }
  }

  private getCards(voteID: number): Card[] {
    if (voteID === 0) {
      return this.cards;
    } else if (voteID === 1) {
      return this.favCards;
    } else if (voteID === 2) {
      return this.banCards;
    }
  }

  private setOpenCards(newCards: OpenCard[], voteID: number): void {
    if (voteID === 0) {
      this.openCards = newCards;
    } else if (voteID === 1) {
      this.openFavCards = newCards;
    } else if (voteID === 2) {
      this.openBanCards = newCards;
    }
  }

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
