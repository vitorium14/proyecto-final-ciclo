import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../shared/footer/footer.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { ToastComponent } from "../../shared/toast/toast.component";

@Component({
    selector: 'app-main-layout',
    imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    ToastComponent
],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {

} 