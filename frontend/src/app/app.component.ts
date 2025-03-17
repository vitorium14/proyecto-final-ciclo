import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsContainerComponent } from './shared/toasts-container/toasts-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
}
