import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastInfo } from './toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
        <div *ngFor="let toast of toasts" 
            class="toast fade-in"
            [ngClass]="{
                'toast-success': toast.type === 'success',
                'toast-error': toast.type === 'error',
                'toast-info': toast.type === 'info',
                'toast-warning': toast.type === 'warning'
            }">
            <div class="toast-header">
                <i class="bi" 
                   [ngClass]="{
                     'bi-check-circle-fill': toast.type === 'success',
                     'bi-x-circle-fill': toast.type === 'error',
                     'bi-info-circle-fill': toast.type === 'info',
                     'bi-exclamation-triangle-fill': toast.type === 'warning'
                   }"></i>
                <span class="toast-title">
                    {{ toast.type | titlecase }}
                </span>
                <button class="toast-close" (click)="closeToast(toast.id)">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="toast-body">
                {{ toast.message }}
            </div>
        </div>
    </div>
    `,
    styles: [`
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
    }
    
    .toast {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .toast-header {
        display: flex;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .toast-header i {
        font-size: 1.2rem;
        margin-right: 8px;
    }
    
    .toast-title {
        font-weight: 600;
        flex: 1;
    }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    
    .toast-close:hover {
        opacity: 1;
    }
    
    .toast-body {
        padding: 15px;
    }
    
    .toast-success {
        border-left: 5px solid var(--success-color);
    }
    
    .toast-success .toast-header i {
        color: var(--success-color);
    }
    
    .toast-error {
        border-left: 5px solid var(--danger-color);
    }
    
    .toast-error .toast-header i {
        color: var(--danger-color);
    }
    
    .toast-info {
        border-left: 5px solid var(--info-color);
    }
    
    .toast-info .toast-header i {
        color: var(--info-color);
    }
    
    .toast-warning {
        border-left: 5px solid var(--warning-color);
    }
    
    .toast-warning .toast-header i {
        color: var(--warning-color);
    }
    `]
})
export class ToastComponent implements OnInit {
    toasts: ToastInfo[] = [];
    
    constructor(private toastService: ToastService) {}
    
    ngOnInit(): void {
        this.toastService.getToasts().subscribe(toasts => {
            this.toasts = toasts;
        });
    }
    
    closeToast(id: number): void {
        this.toastService.remove(id);
    }
} 