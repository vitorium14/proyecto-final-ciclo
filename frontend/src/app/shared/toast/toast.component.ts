import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;
  private toastTimers: Map<number, any> = new Map();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      // Guardar nuevos toasts y configurar sus timers
      const currentToastIds = this.toasts.map(t => t.id);
      
      // Para cada nuevo toast que no estaba antes, iniciar el temporizador
      toasts.forEach(toast => {
        if (!currentToastIds.includes(toast.id)) {
          this.setToastTimeout(toast);
        }
      });

      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Limpiar todos los temporizadores al destruir el componente
    this.clearAllTimers();
  }

  removeToast(id: number): void {
    this.clearTimer(id);
    this.toastService.remove(id);
  }

  private setToastTimeout(toast: Toast): void {
    // Limpiar cualquier temporizador existente para este toast
    this.clearTimer(toast.id);
    
    // Configurar un nuevo temporizador para que el toast desaparezca automáticamente
    const timerId = setTimeout(() => {
      this.toastService.remove(toast.id);
      this.toastTimers.delete(toast.id);
    }, toast.delay || 5000);
    
    // Guardar la referencia al temporizador para poder limpiarlo después
    this.toastTimers.set(toast.id, timerId);
  }

  private clearTimer(id: number): void {
    if (this.toastTimers.has(id)) {
      clearTimeout(this.toastTimers.get(id));
      this.toastTimers.delete(id);
    }
  }

  private clearAllTimers(): void {
    this.toastTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.toastTimers.clear();
  }

  getToastClasses(toast: Toast): string {
    const baseClasses = 'toast show';
    const typeClass = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-dark'
    }[toast.type];

    return `${baseClasses} ${typeClass}`;
  }

  getIconClass(toast: Toast): string {
    return {
      success: 'bi bi-check-circle-fill',
      error: 'bi bi-exclamation-circle-fill',
      warning: 'bi bi-exclamation-triangle-fill',
      info: 'bi bi-info-circle-fill'
    }[toast.type];
  }
} 