import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  // Tiempos de desaparición por defecto según el tipo (en milisegundos)
  private defaultDelays = {
    success: 3000,   // Los éxitos se muestran menos tiempo
    error: 6000,     // Los errores se muestran más tiempo
    warning: 5000,   // Las advertencias tiempo intermedio
    info: 4000       // Las informaciones tiempo estándar
  };

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }

  show(message: string, options: Partial<Omit<Toast, 'id' | 'message'>> = {}): void {
    const type = options.type || 'info';
    
    const toast: Toast = {
      id: this.counter++,
      message,
      type,
      title: options.title,
      // Usar el tiempo específico proporcionado o el predeterminado para el tipo
      delay: options.delay || this.defaultDelays[type]
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);
  }

  success(message: string, title?: string, delay?: number): void {
    this.show(message, { type: 'success', title, delay });
  }

  error(message: string, title?: string, delay?: number): void {
    this.show(message, { type: 'error', title, delay });
  }

  info(message: string, title?: string, delay?: number): void {
    this.show(message, { type: 'info', title, delay });
  }

  warning(message: string, title?: string, delay?: number): void {
    this.show(message, { type: 'warning', title, delay });
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
} 