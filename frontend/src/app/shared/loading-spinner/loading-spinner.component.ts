import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="loading-container" [ngClass]="{'overlay': overlay}">
        <div class="loading-spinner"></div>
        <p *ngIf="message" class="loading-message mt-3">{{ message }}</p>
    </div>
    `,
    styles: [`
    .loading-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px 0;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: var(--primary-color, #FF8C00);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .loading-message {
        color: #6c757d;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 9999;
    }
    `]
})
export class LoadingSpinnerComponent {
    @Input() message?: string;
    @Input() overlay = false;
} 