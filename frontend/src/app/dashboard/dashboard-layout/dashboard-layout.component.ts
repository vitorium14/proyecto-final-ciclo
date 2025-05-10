import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, ToastComponent],
    templateUrl: './dashboard-layout.component.html',
    styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
    isSidebarToggled = false;
    pageTitle = 'Management Dashboard';
    currentYear = new Date().getFullYear();

    ngOnInit(): void {
        // Check screen size on init to set initial sidebar state
        this.checkScreenSize();
        
        // Listen for window resize to adjust sidebar
        this.addEventListeners();
        
        // Apply animations with a slight delay
        setTimeout(() => {
            this.initAnimations();
        }, 100);
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkScreenSize();
    }

    toggleSidebar(): void {
        this.isSidebarToggled = !this.isSidebarToggled;
        localStorage.setItem('sidebarState', this.isSidebarToggled.toString());
    }
    
    private checkScreenSize(): void {
        // On mobile devices (< 992px) the sidebar should be collapsed by default
        if (window.innerWidth < 992 && !this.isSidebarToggled) {
            this.isSidebarToggled = true;
        } else if (window.innerWidth >= 992) {
            // On larger screens, restore user preference if available
            const savedState = localStorage.getItem('sidebarState');
            if (savedState !== null) {
                this.isSidebarToggled = savedState === 'true';
            }
        }
    }
    
    private addEventListeners(): void {
        // Listen for route changes to update page title if needed
        // This would require Router service if implemented
    }
    
    private initAnimations(): void {
        // Add animation classes to elements
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            (item as HTMLElement).style.setProperty('--index', `${index + 1}`);
        });
    }
} 