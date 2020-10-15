import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @Output() clickedFavList = new EventEmitter();
  @Output() clickedBanList = new EventEmitter();

  public favIcon = 'fav';
  public favText = 'Избранное';

  public banIcon = 'ban';
  public banText = 'Черный список';

  constructor() { }

  ngOnInit(): void {
  }

  clickFavBtn(): void {
    this.clickedFavList.emit();
  }

  clickBanBtn(): void {
    this.clickedBanList.emit();
  }
}
