import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faStar, IconDefinition, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faBan, faSignInAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  
  @Input() iconType: string;
  @Input() text = '';

  @Output() clicked = new EventEmitter();

  icon: IconDefinition;
  isText = false;

  constructor() { }

  ngOnInit(): void {
    if (this.iconType === 'fav') {
      this.icon = faStar;
    } else if (this.iconType === 'ban') {
      this.icon = faBan;
    } else if (this.iconType === 'arrow') {
      this.icon = faSignInAlt;
    } else if (this.iconType === 'del') {
      this.icon = faTrashAlt;
    } else if (this.iconType === 'exit') {
      this.icon = faTimesCircle;
    }

    if (this.text) {
      this.isText = true;
    }
  }

  action(): void {
    this.clicked.emit();
  }

}
