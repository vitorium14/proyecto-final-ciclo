<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ApiExceptionListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        // Queremos que se ejecute después del ExceptionListener de Symfony por defecto (prioridad más baja)
        // o con una prioridad específica si necesitamos sobreescribir algo más.
        // Para un manejo de errores JSON personalizado, a menudo es mejor tener una prioridad alta
        // para asegurarse de que es nuestro listener el que formatea la respuesta final.
        // La prioridad por defecto es 0. Valores más altos se ejecutan antes.
        return [
            KernelEvents::EXCEPTION => ['onKernelException', 1], // Prioridad 1 para que se ejecute relativamente pronto
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $response = null;
        $statusCode = JsonResponse::HTTP_INTERNAL_SERVER_ERROR; // Default para excepciones no HTTP
        $message = 'An unexpected error occurred.'; // Default message

        if ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
            $message = $exception->getMessage();
            // Symfony a menudo usa el mensaje de la excepción directamente, que puede ser detallado.
            // Para algunos códigos HTTP, podrías querer un mensaje más genérico.
            // Ejemplo: para 404, el mensaje de Symfony es "Not Found", que es bueno.
            // Para 403, "Forbidden".
        } else {
            // Para excepciones no HTTP, no queremos exponer detalles internos en producción.
            // En modo debug, podrías querer más detalles, pero eso se maneja mejor con el profiler de Symfony.
            // Para la respuesta JSON de la API, un mensaje genérico es más seguro.
            // Aquí podrías añadir logging de la excepción real:
            // $this->logger->error($exception->getMessage(), ['exception' => $exception]);
            // (Necesitarías inyectar un logger para eso)
        }

        // Si el mensaje de la excepción está vacío (puede ocurrir con algunas HttpException construidas sin mensaje)
        if (empty($message) && $statusCode === JsonResponse::HTTP_INTERNAL_SERVER_ERROR) {
            $message = 'Internal Server Error';
        } elseif (empty($message) && $statusCode === JsonResponse::HTTP_NOT_FOUND) {
            $message = 'Resource not found.';
        } elseif (empty($message) && $statusCode === JsonResponse::HTTP_FORBIDDEN) {
            $message = 'Access denied.';
        } elseif (empty($message) && $statusCode === JsonResponse::HTTP_UNAUTHORIZED) {
            $message = 'Authentication required.';
        }


        $responseData = [
            'status_code' => $statusCode,
            'message' => $message,
        ];

        $response = new JsonResponse($responseData, $statusCode);
        $event->setResponse($response);
    }
}
