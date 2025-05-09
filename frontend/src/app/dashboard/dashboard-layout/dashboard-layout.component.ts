import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard-layout.component.html',
    styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
    isSidebarToggled = false;

    ngOnInit(): void {
        // Optional: Add event listener for sidebar toggle if not handled by Bootstrap's JS
        // For a pure Angular solution, we can manage the toggle state here.
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('wrapper')?.classList.toggle('toggled');
                this.isSidebarToggled = !this.isSidebarToggled;
            });
        }
    }

    // Or, a method to be called from the template directly
    toggleSidebar(): void {
        document.getElementById('wrapper')?.classList.toggle('toggled');
        this.isSidebarToggled = !this.isSidebarToggled;
        // If you prefer to bind to a class on the wrapper directly in the template:
        // [class.toggled]="isSidebarToggled" on #wrapper
        // And call this method from (click) on the button, then this method
        // would just be: this.isSidebarToggled = !this.isSidebarToggled;
    }
} 