import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastInfo {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    autoClose?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts: BehaviorSubject<ToastInfo[]> = new BehaviorSubject<ToastInfo[]>([]);
    private counter = 0;

    getToasts(): Observable<ToastInfo[]> {
        return this.toasts.asObservable();
    }

    success(message: string, autoClose = true): number {
        return this.show(message, 'success', autoClose);
    }

    error(message: string, autoClose = true): number {
        return this.show(message, 'error', autoClose);
    }

    info(message: string, autoClose = true): number {
        return this.show(message, 'info', autoClose);
    }

    warning(message: string, autoClose = true): number {
        return this.show(message, 'warning', autoClose);
    }

    show(message: string, type: 'success' | 'error' | 'info' | 'warning', autoClose = true): number {
        const id = ++this.counter;
        const toast: ToastInfo = { id, message, type, autoClose };
        const current = this.toasts.getValue();
        this.toasts.next([...current, toast]);

        if (autoClose) {
            setTimeout(() => this.remove(id), 5000);
        }
        
        return id;
    }

    remove(id: number): void {
        const current = this.toasts.getValue();
        this.toasts.next(current.filter(toast => toast.id !== id));
    }
} 