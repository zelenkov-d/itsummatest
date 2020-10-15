import { Component, HostListener } from '@angular/core';
import { DataStorageService } from './data-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'itsummatest';

  showFavList = false;
  showBanList = false;

  constructor(private dataStorageService: DataStorageService) {}

  ngOnInit(): void {
    this.dataStorageService.loadFromLocalStorage();
  }

  onScroll(data): void {
    console.log("s");
    let id = data[0];
    let voteID = data[1];
    this.dataStorageService.loadPartData(id, voteID);
  }

  closeList() {
    this.showBanList = false;
    this.showFavList = false;
    this.dataStorageService.clearExtraCards();
  }

  clickFavList() {
    this.showBanList = false;
    this.showFavList = true;
  }

  clickBanList() {
    this.showFavList = false;
    this.showBanList = true;
  }

  @HostListener('window:beforeunload')
  getIDfromURL(): void {
    let id = +window.location.hash.substring(1);
    this.dataStorageService.setCurrentIDtoStorage(id);
  }
}
