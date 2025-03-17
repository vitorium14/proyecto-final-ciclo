import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsContainer } from "./shared/toasts-container/toasts-container.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsContainer],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
