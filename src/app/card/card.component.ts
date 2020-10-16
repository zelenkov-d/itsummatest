import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Card } from '../card';
import { Location } from '@angular/common';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('card') elem: ElementRef<HTMLElement>;

  @Input() card: Card;
  @Output() clicked = new EventEmitter();
  @Output() leftBtnClicked = new EventEmitter();
  @Output() rightBtnClicked = new EventEmitter();

  private observer: IntersectionObserver;
  private height: number;
  private width: number;

  public id: number;
  public collapsedImgURL: string;
  public uncollapsedImgURL: string;
  public desc: string;
  public open: boolean;
  public vote: number;

  public leftIcon = 'fav';
  public rightIcon = 'ban';

  constructor(private host: ElementRef, private location: Location) { }

  get element(): any {
    return this.host.nativeElement;
  }

  ngOnInit(): void {
    this.initData();
    this.initIcons();
  }

  private initData(): void {
    if (this.card) {
      this.id = this.card.id;
      this.collapsedImgURL = this.card.collapsedPhoto;
      this.uncollapsedImgURL = this.card.uncollapsedPhoto;
      if (this.card.open) {
        this.desc = this.card.description;
      } else {
        this.desc = this.card.description.substr(0, 140);
      }
      this.open = this.card.open;
      this.vote = this.card.vote;
    }
  }

  mouse(event): void {
    this.width = event.currentTarget.offsetWidth;
    this.height = event.currentTarget.offsetHeight;
  }

  touch(event): void {
    this.width = event.currentTarget.offsetWidth;
    this.height = event.currentTarget.offsetHeight;
  }

  ended(event: CdkDragEnd): void {
    if (event.distance.x > 60) {
      this.clickRightBtn();
    } else if (event.distance.x < -60) {
      this.clickLeftBtn();
    }
  }

  started(event: CdkDragStart): void {
    event.source.getPlaceholderElement().style.width = `${this.width}px`;
    event.source.getPlaceholderElement().style.height = `${this.height}px`;
  }

  clickCard(): void {
    this.clicked.emit(this.id);
    this.open = !this.open;
    if (this.open) {
      this.desc = this.card.description;
    } else {
      this.desc = this.card.description.substr(0, 140);
    }
  }

  clickLeftBtn(): void {
    this.leftBtnClicked.emit(this.id);
  }

  clickRightBtn(): void {
    this.rightBtnClicked.emit(this.id);
  }

  ngAfterViewInit(): void {
    const options = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
      rootMargin: '0px',
      threshold: 0.9
    };

    this.observer = new IntersectionObserver(([entry]) => {
      const elemTop = this.elem.nativeElement.getBoundingClientRect().top;
      const elemID = +this.elem.nativeElement.id;
      if (elemTop <= 0) {
        this.putUrl(elemID);
      }
    }, options);

    this.observer.observe(this.elem.nativeElement);
  }

  initIcons(): void {
    if (this.vote === 0) {
      this.leftIcon = 'ban';
      this.rightIcon = 'fav';
    } else {
      this.leftIcon = 'del';
      this.rightIcon = 'arrow';
    }
  }

  private isHostScrollable(): boolean {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  private putUrl(id: number): void {
    this.location.replaceState(`/#${id}`);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
