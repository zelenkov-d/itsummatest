import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Card } from '../card';
import { Location } from '@angular/common'; 
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @ViewChild('card') elem: ElementRef<HTMLElement>;
  
  @Input() card: Card;
  @Output() clicked = new EventEmitter();
  @Output() leftBtnClicked = new EventEmitter();
  @Output() rightBtnClicked = new EventEmitter();

  private observer: IntersectionObserver;

  public id: number;
  public collapsedImgURL: string;
  public uncollapsedImgURL: string;
  public desc: string;
  public open: boolean;
  public vote: number;

  public leftIcon = 'fav';
  public rightIcon = 'ban';

  constructor(private host: ElementRef, private location: Location) { }

  get element() {
    return this.host.nativeElement;
  }

  ngOnInit(): void {
    this.initData();
    this.initIcons();
  }

  drop(id) {
    console.log("d");
  }

  private initData(): void {
    if (this.card) {
      this.id = this.card.id;
      this.collapsedImgURL = this.card.collapsed_photo;
      this.uncollapsedImgURL = this.card.uncollapsed_photo;
      if (this.card.open) {
        this.desc = this.card.description;
      } else {
        this.desc = this.card.description.substr(0, 140);
      }
      this.open = this.card.open;
      this.vote = this.card.vote;
    }
  }

  ended(event: CdkDragEnd) {
    if (event.distance.x > 60) {
      this.clickRightBtn();
    } else if (event.distance.x < -60) {
      this.clickLeftBtn();
    }
  }

  clickCard() {
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
      let elemTop = this.elem.nativeElement.getBoundingClientRect().top;
      let elemID = +this.elem.nativeElement.id;
      if (elemTop <= 0) this.putUrl(elemID); 
    }, options);

    this.observer.observe(this.elem.nativeElement);
  }

  initIcons() {
    if (this.vote === 0) {
      this.leftIcon = 'ban';
      this.rightIcon = 'fav';
    } else {
      this.leftIcon = 'del';
      this.rightIcon = 'arrow';
    }
  }

  private isHostScrollable() {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  private putUrl(id: number): void {
    this.location.replaceState(`/#${id}`);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
