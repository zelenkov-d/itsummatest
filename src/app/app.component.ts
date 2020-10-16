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

  /**
   * Подгрузка части карточек при прокрутке
   *
   * @param data Массив значений полученных от списка
   * [0] - ID последней карточки предыдущей части,
   * [1] - ID списка/голоса карточек (0 - основные, 1 - избранные, 2 - в черном списке)
   */
  onScroll(data): void {
    const id = data[0];
    const voteID = data[1];
    this.dataStorageService.loadPartData(id, voteID);
  }

  /**
   * Закрытие всплывающего списка
   */
  closeList(): void {
    this.showBanList = false;
    this.showFavList = false;
    this.dataStorageService.clearExtraCards();
  }

  /**
   * Открытие спика избранных карточек
   */
  clickFavList(): void {
    this.showBanList = false;
    this.showFavList = true;
  }

  /**
   * Открытие черного спика
   */
  clickBanList(): void {
    this.showFavList = false;
    this.showBanList = true;
  }

  /**
   * Получение и запись hash ID при обновлении или закрытии вкладки
   */
  @HostListener('window:beforeunload')
  getIDfromURL(): void {
    const id = +window.location.hash.substring(1);
    this.dataStorageService.setCurrentIDtoStorage(id);
  }
}
