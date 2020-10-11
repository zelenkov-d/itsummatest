import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpListComponent } from './pop-up-list.component';

describe('PopUpListComponent', () => {
  let component: PopUpListComponent;
  let fixture: ComponentFixture<PopUpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
