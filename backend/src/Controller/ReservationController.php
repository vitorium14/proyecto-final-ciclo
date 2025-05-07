<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\Room;
use App\Entity\Service;
use App\Repository\ReservationRepository;
use App\Repository\RoomRepository;
use App\Repository\ServiceRepository;
use App\Service\LogService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use DateTime;

#[Route('/api/reservations')]
class ReservationController extends AbstractController
{
    public function __construct(
        private LogService $logService
    ) {}

    #[Route('/available-rooms', name: 'get_available_rooms', methods: ['GET'])]
    public function getAvailableRooms(
        Request $request,
        RoomRepository $roomRepository,
        ReservationRepository $reservationRepository
    ): JsonResponse {
        $checkIn = $request->query->get('checkIn');
        $checkOut = $request->query->get('checkOut');
        $roomTypeId = $request->query->get('roomTypeId');

        if (!$checkIn || !$checkOut) {
            return $this->json([
                'error' => 'Las fechas de check-in y check-out son requeridas'
            ], 400);
        }

        try {
            $checkInDate = new DateTime($checkIn);
            $checkOutDate = new DateTime($checkOut);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Formato de fecha inválido'
            ], 400);
        }

        if ($checkInDate >= $checkOutDate) {
            return $this->json([
                'error' => 'La fecha de check-in debe ser anterior a la fecha de check-out'
            ], 400);
        }

        $rooms = $roomRepository->findAll();
        $availableRooms = [];

        foreach ($rooms as $room) {
            if ($roomTypeId && $room->getRoomType()->getId() != $roomTypeId) {
                continue;
            }

            if ($reservationRepository->isRoomAvailable($room->getId(), $checkInDate, $checkOutDate)) {
                $availableRooms[] = $room;
            }
        }

        return $this->json([
            'rooms' => $availableRooms
        ], 200, [], ['groups' => 'room:read']);
    }

    #[Route('', name: 'get_all_reservations', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAllReservations(
        Request $request,
        ReservationRepository $reservationRepository
    ): JsonResponse {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $status = $request->query->get('status');
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $qb = $reservationRepository->createQueryBuilder('r')
            ->orderBy('r.createdAt', 'DESC');

        if ($status) {
            $qb->andWhere('r.status = :status')
                ->setParameter('status', $status);
        }

        if ($startDate) {
            $qb->andWhere('r.checkIn >= :startDate')
                ->setParameter('startDate', new DateTime($startDate));
        }

        if ($endDate) {
            $qb->andWhere('r.checkOut <= :endDate')
                ->setParameter('endDate', new DateTime($endDate));
        }

        $total = count($qb->getQuery()->getResult());
        $reservations = $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->json([
            'reservations' => $reservations,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]);
    }

    #[Route('/my-reservations', name: 'get_my_reservations', methods: ['GET'])]
    public function getMyReservations(
        Request $request,
        ReservationRepository $reservationRepository
    ): JsonResponse {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $status = $request->query->get('status');

        $user = $this->getUser();
        $reservations = $reservationRepository->getActiveReservationsForUser($user->getId());

        if ($status) {
            $reservations = array_filter($reservations, function($reservation) use ($status) {
                return $reservation->getStatus() === $status;
            });
        }

        $total = count($reservations);
        $reservations = array_slice($reservations, ($page - 1) * $limit, $limit);

        return $this->json([
            'reservations' => $reservations,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]);
    }

    #[Route('/{id}', name: 'get_reservation', methods: ['GET'])]
    public function getReservation(int $id, ReservationRepository $reservationRepository): JsonResponse
    {
        $reservation = $reservationRepository->find($id);

        if (!$reservation) {
            return $this->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }

        $user = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'error' => 'No tienes permiso para ver esta reserva'
            ], 403);
        }

        return $this->json($reservation);
    }

    #[Route('', name: 'create_reservation', methods: ['POST'])]
    public function createReservation(
        Request $request,
        EntityManagerInterface $entityManager,
        RoomRepository $roomRepository,
        ReservationRepository $reservationRepository,
        ServiceRepository $serviceRepository,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['roomId'], $data['checkIn'], $data['checkOut'])) {
            return $this->json([
                'error' => 'Faltan campos requeridos'
            ], 400);
        }

        try {
            $checkIn = new DateTime($data['checkIn']);
            $checkOut = new DateTime($data['checkOut']);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Formato de fecha inválido'
            ], 400);
        }

        // Validar que las fechas sean futuras
        $now = new DateTime();
        if ($checkIn < $now) {
            return $this->json([
                'error' => 'La fecha de check-in debe ser futura'
            ], 400);
        }

        if ($checkIn >= $checkOut) {
            return $this->json([
                'error' => 'La fecha de check-in debe ser anterior a la fecha de check-out'
            ], 400);
        }

        // Validar límite de días de reserva (máximo 30 días)
        $interval = $checkIn->diff($checkOut);
        if ($interval->days > 30) {
            return $this->json([
                'error' => 'La reserva no puede exceder los 30 días'
            ], 400);
        }

        $room = $roomRepository->find($data['roomId']);
        if (!$room) {
            return $this->json([
                'error' => 'Habitación no encontrada'
            ], 404);
        }

        // Validar estado de la habitación
        if ($room->getStatus() !== 'available') {
            return $this->json([
                'error' => 'La habitación no está disponible para reservas'
            ], 400);
        }

        if (!$reservationRepository->isRoomAvailable($room->getId(), $checkIn, $checkOut)) {
            return $this->json([
                'error' => 'La habitación no está disponible para las fechas seleccionadas'
            ], 400);
        }

        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setUser($this->getUser());
        $reservation->setCheckIn($checkIn);
        $reservation->setCheckOut($checkOut);
        $reservation->setCreatedAt(new \DateTimeImmutable());
        $reservation->setObservations($data['observations'] ?? null);

        // Calcular el precio total de la habitación
        $nights = $checkIn->diff($checkOut)->days;
        $totalPrice = $room->getRoomType()->getPrice() * $nights;

        $serviceDetails = [];
        // Añadir servicios si se proporcionan
        if (isset($data['services']) && is_array($data['services'])) {
            foreach ($data['services'] as $serviceId) {
                $service = $serviceRepository->find($serviceId);
                if (!$service) {
                    return $this->json([
                        'error' => "Servicio con ID $serviceId no encontrado"
                    ], 404);
                }
                $reservation->addService($service);
                $totalPrice += $service->getPrice();
                $serviceDetails[] = $service->getName();
            }
        }

        $reservation->setTotalPrice($totalPrice);

        $errors = $validator->validate($reservation);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Error de validación',
                'details' => (string) $errors
            ], 400);
        }

        $entityManager->persist($reservation);
        $entityManager->flush();

        // Crear log de la acción
        $details = sprintf(
            'Reserva creada para la habitación %s del %s al %s. Servicios: %s. Precio total: %s',
            $room->getNumber(),
            $checkIn->format('Y-m-d'),
            $checkOut->format('Y-m-d'),
            !empty($serviceDetails) ? implode(', ', $serviceDetails) : 'Ninguno',
            $totalPrice
        );
        $this->logService->createLog(
            $this->getUser(),
            'create',
            'reservation',
            $reservation->getId(),
            $details
        );

        return $this->json($reservation, 201);
    }

    #[Route('/{id}', name: 'update_reservation', methods: ['PUT'])]
    public function updateReservation(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ReservationRepository $reservationRepository,
        RoomRepository $roomRepository,
        ServiceRepository $serviceRepository,
        ValidatorInterface $validator
    ): JsonResponse {
        $reservation = $reservationRepository->find($id);

        if (!$reservation) {
            return $this->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }

        $user = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'error' => 'No tienes permiso para modificar esta reserva'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        $needsPriceRecalculation = false;
        $changes = [];

        if (isset($data['checkIn'])) {
            try {
                $oldCheckIn = $reservation->getCheckIn()->format('Y-m-d');
                $checkIn = new DateTime($data['checkIn']);
                $reservation->setCheckIn($checkIn);
                $changes[] = "Check-in: $oldCheckIn -> " . $checkIn->format('Y-m-d');
                $needsPriceRecalculation = true;
            } catch (\Exception $e) {
                return $this->json([
                    'error' => 'Formato de fecha de check-in inválido'
                ], 400);
            }
        }

        if (isset($data['checkOut'])) {
            try {
                $oldCheckOut = $reservation->getCheckOut()->format('Y-m-d');
                $checkOut = new DateTime($data['checkOut']);
                $reservation->setCheckOut($checkOut);
                $changes[] = "Check-out: $oldCheckOut -> " . $checkOut->format('Y-m-d');
                $needsPriceRecalculation = true;
            } catch (\Exception $e) {
                return $this->json([
                    'error' => 'Formato de fecha de check-out inválido'
                ], 400);
            }
        }

        if (isset($data['observations'])) {
            $oldObservations = $reservation->getObservations();
            $reservation->setObservations($data['observations']);
            $changes[] = "Observaciones actualizadas";
        }

        if (isset($data['roomId'])) {
            $oldRoom = $reservation->getRoom();
            $room = $roomRepository->find($data['roomId']);
            if (!$room) {
                return $this->json([
                    'error' => 'Habitación no encontrada'
                ], 404);
            }
            $reservation->setRoom($room);
            $changes[] = "Habitación: {$oldRoom->getNumber()} -> {$room->getNumber()}";
            $needsPriceRecalculation = true;
        }

        // Actualizar servicios si se proporcionan
        if (isset($data['services']) && is_array($data['services'])) {
            $oldServices = array_map(fn($s) => $s->getName(), $reservation->getServices()->toArray());
            
            // Limpiar servicios existentes
            foreach ($reservation->getServices() as $service) {
                $reservation->removeService($service);
            }
            
            // Añadir nuevos servicios
            $newServices = [];
            foreach ($data['services'] as $serviceId) {
                $service = $serviceRepository->find($serviceId);
                if (!$service) {
                    return $this->json([
                        'error' => "Servicio con ID $serviceId no encontrado"
                    ], 404);
                }
                $reservation->addService($service);
                $newServices[] = $service->getName();
            }
            
            $changes[] = "Servicios: " . implode(', ', $oldServices) . " -> " . implode(', ', $newServices);
            $needsPriceRecalculation = true;
        }

        // Verificar disponibilidad si se modificaron las fechas o la habitación
        if (isset($data['checkIn']) || isset($data['checkOut']) || isset($data['roomId'])) {
            if (!$reservationRepository->isRoomAvailable(
                $reservation->getRoom()->getId(),
                $reservation->getCheckIn(),
                $reservation->getCheckOut(),
                $reservation->getId()
            )) {
                return $this->json([
                    'error' => 'La habitación no está disponible para las fechas seleccionadas'
                ], 400);
            }
        }

        // Recalcular el precio total si es necesario
        if ($needsPriceRecalculation) {
            $oldPrice = $reservation->getTotalPrice();
            $nights = $reservation->getCheckIn()->diff($reservation->getCheckOut())->days;
            $totalPrice = $reservation->getRoom()->getRoomType()->getPrice() * $nights;

            // Añadir precio de los servicios
            foreach ($reservation->getServices() as $service) {
                $totalPrice += $service->getPrice();
            }

            $reservation->setTotalPrice($totalPrice);
            $changes[] = "Precio total: $oldPrice -> $totalPrice";
        }

        $errors = $validator->validate($reservation);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Error de validación',
                'details' => (string) $errors
            ], 400);
        }

        $entityManager->flush();

        // Crear log de la acción
        if (!empty($changes)) {
            $details = sprintf(
                'Reserva %d actualizada. Cambios: %s',
                $reservation->getId(),
                implode(', ', $changes)
            );
            $this->logService->createLog(
                $this->getUser(),
                'update',
                'reservation',
                $reservation->getId(),
                $details
            );
        }

        return $this->json($reservation);
    }

    #[Route('/{id}/cancel', name: 'cancel_reservation', methods: ['POST'])]
    public function cancelReservation(
        int $id,
        EntityManagerInterface $entityManager,
        ReservationRepository $reservationRepository
    ): JsonResponse {
        $reservation = $reservationRepository->find($id);

        if (!$reservation) {
            return $this->json([
                'error' => 'Reserva no encontrada'
            ], 404);
        }

        $user = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'error' => 'No tienes permiso para cancelar esta reserva'
            ], 403);
        }

        if ($reservation->getStatus() === 'cancelled') {
            return $this->json([
                'error' => 'La reserva ya está cancelada'
            ], 400);
        }

        if ($reservation->getCheckIn() <= new DateTime()) {
            return $this->json([
                'error' => 'No se puede cancelar una reserva que ya ha comenzado'
            ], 400);
        }

        $reservation->setStatus('cancelled');
        $entityManager->flush();

        // Crear log de la acción
        $details = sprintf(
            'Reserva %d cancelada. Habitación: %s, Fechas: %s - %s',
            $reservation->getId(),
            $reservation->getRoom()->getNumber(),
            $reservation->getCheckIn()->format('Y-m-d'),
            $reservation->getCheckOut()->format('Y-m-d')
        );
        $this->logService->createLog(
            $this->getUser(),
            'delete',
            'reservation',
            $reservation->getId(),
            $details
        );

        return $this->json($reservation);
    }
} 