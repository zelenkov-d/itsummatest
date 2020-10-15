import { Component, HostListener, OnInit } from '@angular/core';
import { DataStorageService } from './data-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'itsummatest';

  showFavList = false;
  showBanList = false;

  constructor(private dataStorageService: DataStorageService) {}

  ngOnInit(): void {
    this.dataStorageService.loadFromLocalStorage();
  }

  onScroll(data): void {
    const id = data[0];
    const voteID = data[1];
    this.dataStorageService.loadPartData(id, voteID);
  }

  closeList(): void {
    this.showBanList = false;
    this.showFavList = false;
    this.dataStorageService.clearExtraCards();
  }

  clickFavList(): void {
    this.showBanList = false;
    this.showFavList = true;
  }

  clickBanList(): void {
    this.showFavList = false;
    this.showBanList = true;
  }

  @HostListener('window:beforeunload')
  getIDfromURL(): void {
    const id = +window.location.hash.substring(1);
    this.dataStorageService.setCurrentIDtoStorage(id);
  }
}
