import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toasts',
  imports: [NgbToastModule],
  templateUrl: './toasts-container.component.html',
  styleUrl: './toasts-container.component.css',
  host: {
    class: 'toast-container position-fixed bottom-0 end-0 p-3',
    style: 'z-index: 1200',
  },
})
export class ToastsContainerComponent {
  constructor(public toastService: ToastService) {}
}
