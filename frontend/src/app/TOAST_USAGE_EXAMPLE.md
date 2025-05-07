# Toast Notification Usage Guide

Esta guía muestra cómo utilizar el servicio de notificaciones toast en cualquier componente de la aplicación.

## Paso 1: Importar el servicio de toast

Añade el servicio de toast en el constructor de tu componente:

```typescript
import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-mi-componente',
  // ...
})
export class MiComponente {
  constructor(private toastService: ToastService) {}
  
  // Resto del componente...
}
```

## Paso 2: Utilizar el servicio para mostrar notificaciones

Hay varios métodos disponibles para mostrar diferentes tipos de notificaciones:

### Notificación de éxito (verde) - Desaparece automáticamente en 3 segundos por defecto

```typescript
this.toastService.success('Operación completada con éxito', 'Éxito');
```

### Notificación de error (rojo) - Desaparece automáticamente en 6 segundos por defecto

```typescript
this.toastService.error('No se pudo completar la operación', 'Error');
```

### Notificación de advertencia (amarillo) - Desaparece automáticamente en 5 segundos por defecto

```typescript
this.toastService.warning('Tenga cuidado con esta acción', 'Advertencia');
```

### Notificación informativa (azul) - Desaparece automáticamente en 4 segundos por defecto

```typescript
this.toastService.info('Esta es una información importante', 'Información');
```

### Personalizar tiempo de desaparición

Puedes especificar un tiempo personalizado (en milisegundos) para cada tipo de toast:

```typescript
// El toast se mostrará durante 10 segundos (10000 ms)
this.toastService.error('Error crítico que requiere atención', 'Error', 10000);

// El toast se mostrará durante 2 segundos (2000 ms)
this.toastService.success('¡Guardado rápido!', 'Éxito', 2000);
```

### Método general para mayor personalización

```typescript
this.toastService.show('Mensaje personalizado', {
  type: 'success', // 'success', 'error', 'warning', 'info'
  title: 'Título personalizado',
  delay: 10000 // Duración en milisegundos (personalizado)
});
```

## Ejemplo práctico

```typescript
// En un método que guarda datos
saveData() {
  this.dataService.save(this.form.value).subscribe({
    next: (response) => {
      this.toastService.success('Datos guardados correctamente');
      this.router.navigate(['/lista']);
    },
    error: (err) => {
      // Error crítico, mostrar por más tiempo (8 segundos)
      this.toastService.error('Error al guardar los datos: ' + err.message, 'Error', 8000);
    }
  });
}
```

## Características

- **Desaparición automática**: Todas las notificaciones desaparecen automáticamente después de cierto tiempo.
- **Tiempos personalizados**: Los tiempos predeterminados varían según el tipo de notificación.
- **Animaciones**: Las notificaciones aparecen y desaparecen con animaciones suaves.
- **Personalización**: Puedes personalizar el título, mensaje y tiempo de desaparición. 