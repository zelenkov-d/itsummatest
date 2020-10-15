import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../card';
import { DataStorageService } from '../data-storage.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() vote: string;
  @Output() scrolled = new EventEmitter();
  @Output() closed = new EventEmitter();
  @ViewChild('loader') loader: ElementRef<HTMLElement>;

  public cards: Observable<Card[]>;
  private observer: IntersectionObserver;

  isFavList = false;
  isBanList = false;

  constructor(private dataStorageService: DataStorageService, private host: ElementRef) {
  }

  get element(): any {
    return this.host.nativeElement;
  }

  ngOnInit(): void {
    this.dataStorageService.initData(this.getVoteID());
    this.cards = this.dataStorageService.getData(this.getVoteID());
    this.initListType();
  }

  ngAfterViewInit(): void {
    const options = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver(([entry]) => {
      const prevElement: Element = this.loader.nativeElement.previousElementSibling;
      let lastCardID = 0;
      if (prevElement) {
        lastCardID = +prevElement.lastElementChild.id;
      }
      if (entry.isIntersecting) {
        this.scrolled.emit([lastCardID, this.getVoteID()]);
      }
    }, options);

    this.observer.observe(this.loader.nativeElement);
  }

  clickLeftBtn(id: number): void {
    if (this.isFavList) {
      const result = confirm('Вы уверены, что хотите убрать карточку из избранного?');
      if (result) {
        this.dataStorageService.setToMainListFromFav(id);
      }
    } else if (this.isBanList) {
      const result = confirm('Вы уверены, что хотите убрать карточку из черного списка?');
      if (result) {
        this.dataStorageService.setToMainListFromBan(id);
      }
    } else {
      this.dataStorageService.setToBanListFromMain(id);
    }
  }

  clickRightBtn(id: number): void {
    if (this.isFavList) {
      this.dataStorageService.setToBanListFromFav(id);
    } else if (this.isBanList) {
      this.dataStorageService.setToFavListFromBan(id);
    } else {
      this.dataStorageService.setToFavListFromMain(id);
    }
  }

  clickExitBtn(): void {
    this.closed.emit();
  }

  private isHostScrollable(): boolean {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  onClick(id): void {
    this.dataStorageService.changeOpenCardParam(id, this.getVoteID());
  }

  private getVoteID(): number {
    if (this.vote === 'main') {
      return 0;
    } else if (this.vote === 'fav') {
      return 1;
    } else if (this.vote === 'ban') {
      return 2;
    }
  }

  private initListType(): void {
    if (this.vote === 'fav') {
      this.isFavList = true;
    } else if (this.vote === 'ban') {
      this.isBanList = true;
    }
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
