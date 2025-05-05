<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Reservation;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Mime\Email;

#[Route('/api/reservations')]
final class ReservationController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        RoomRepository $roomRepository,
        EntityManagerInterface $em,
        #[CurrentUser] ?User $user,
        MailerInterface $mailer
    ): JsonResponse {
        if (
            !$this->isGranted('ROLE_CLIENT') &&
            !$this->isGranted('ROLE_EMPLOYEE') &&
            !$this->isGranted('ROLE_ADMIN')
        ) {
            throw $this->createAccessDeniedException('No tienes permiso para crear reservas.');
        }

        $data = json_decode($request->getContent(), true);

        // Validar datos obligatorios
        if (!isset($data['roomId'], $data['checkIn'], $data['checkOut'])) {
            return $this->json(['error' => 'Datos incompletos'], 400);
        }

        $room = $roomRepository->find($data['roomId']);
        if (!$room) {
            return $this->json(['error' => 'Habitación no encontrada'], 404);
        }

        $checkIn = new \DateTime($data['checkIn']);
        $checkOut = new \DateTime($data['checkOut']);

        // Validación básica de fechas
        if ($checkIn >= $checkOut) {
            return $this->json(['error' => 'Fechas inválidas'], 400);
        }

        // Validar disponibilidad (simplificado, sin overlaps reales aún)
        $qb = $em->getRepository(Reservation::class)->createQueryBuilder('r');
        $qb->andWhere('r.room = :room')
            ->andWhere('r.checkOut > :checkIn AND r.checkIn < :checkOut')
            ->setParameters(new \Doctrine\Common\Collections\ArrayCollection([
                'room' => $room,
                'checkIn' => $checkIn,
                'checkOut' => $checkOut
            ]));

        if (count($qb->getQuery()->getResult()) > 0) {
            return $this->json(['error' => 'Habitación ocupada en ese rango'], 409);
        }

        $reservation = new Reservation();
        $reservation->setRoom($room);
        $reservation->setUser($user);
        $reservation->setCheckIn($checkIn);
        $reservation->setCheckOut($checkOut);
        $reservation->setStatus('pendiente');
        $reservation->setCreatedAt(new \DateTimeImmutable());

        $em->persist($reservation);
        $em->flush();

        // Send confirmation email
        $email = (new Email())
            ->from('noreply@test.com')
            ->to($user->getEmail())
            ->subject('Confirmación de Reserva')
            ->text('Tu reserva ha sido creada con éxito. Detalles: ' .
                'Habitación: ' . $room->getNumber() . ', ' .
                'Check-in: ' . $checkIn->format('d-m-Y') . ', ' .
                'Check-out: ' . $checkOut->format('d-m-Y') . '.');
        $mailer->send($email);
        
        return $this->json([
            'message' => 'Reserva creada',
            'id' => $reservation->getId(),
        ], 201);
    }

    #[Route('/my', methods: ['GET'])]
    public function myReservations(
        #[CurrentUser] ?User $user,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'No autenticado'], 401);
        }

        $reservations = $em->getRepository(Reservation::class)->findBy(['user' => $user]);

        $data = array_map(function (Reservation $r) {
            return [
                'id' => $r->getId(),
                'room' => [
                    'id' => $r->getRoom()->getId(),
                    'number' => $r->getRoom()->getNumber(),
                ],
                'checkIn' => $r->getCheckIn()->format('Y-m-d'),
                'checkOut' => $r->getCheckOut()->format('Y-m-d'),
                'status' => $r->getStatus(),
            ];
        }, $reservations);

        return $this->json($data);
    }

    #[Route('', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        if (!$this->isGranted('ROLE_EMPLOYEE') && !$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException('No tienes permiso para ver todas las reservas.');
        }

        $reservations = $em->getRepository(Reservation::class)->findAll();

        $data = array_map(function (Reservation $r) {
            return [
                'id' => $r->getId(),
                'client' => [
                    'id' => $r->getUser()->getId(),
                    'name' => $r->getUser()->getFullName(),
                    'email' => $r->getUser()->getEmail(),
                ],
                'room' => [
                    'id' => $r->getRoom()->getId(),
                    'number' => $r->getRoom()->getNumber(),
                ],
                'checkIn' => $r->getCheckIn()->format('Y-m-d'),
                'checkOut' => $r->getCheckOut()->format('Y-m-d'),
                'status' => $r->getStatus(),
            ];
        }, $reservations);

        return $this->json($data);
    }
// Added method to get a single reservation by ID
    #[Route('/{id}', methods: ['GET'])]
    public function show(Reservation $reservation, #[CurrentUser] ?User $user): JsonResponse
    {
        // Check if user is owner or employee/admin
        if ($reservation->getUser() !== $user && !$this->isGranted('ROLE_EMPLOYEE')) {
             throw $this->createAccessDeniedException('No tienes permiso para ver esta reserva.');
        }

        $data = [
            'id' => $reservation->getId(),
            'client' => [
                'id' => $reservation->getUser()->getId(),
                'name' => $reservation->getUser()->getFullName(),
                'email' => $reservation->getUser()->getEmail(),
            ],
            'room' => [
                'id' => $reservation->getRoom()->getId(),
                'number' => $reservation->getRoom()->getNumber(),
                'type' => $reservation->getRoom()->getType(),
            ],
            'checkIn' => $reservation->getCheckIn()->format('Y-m-d'),
            'checkOut' => $reservation->getCheckOut()->format('Y-m-d'),
            'status' => $reservation->getStatus(),
            'createdAt' => $reservation->getCreatedAt()->format('Y-m-d H:i:s'),
            // Add services associated with the reservation if needed later
        ];
        return $this->json($data);
    }

    // Added method to update a reservation (e.g., status)
    #[Route('/{id}', methods: ['PATCH'])]
    public function update(Reservation $reservation, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if (!$this->isGranted('ROLE_EMPLOYEE')) {
             throw $this->createAccessDeniedException('No tienes permiso para modificar reservas.');
        }

        $data = json_decode($request->getContent(), true);

        // Example: Update status
        if (isset($data['status'])) {
            // Add validation for allowed statuses if needed
            $reservation->setStatus($data['status']);
        }
        // Add other updatable fields as necessary (e.g., checkIn, checkOut, room - with availability checks)

        $em->flush();

        return $this->json(['message' => 'Reserva actualizada']);
    }

    // Added method to delete a reservation
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Reservation $reservation, EntityManagerInterface $em): JsonResponse
    {
        if (!$this->isGranted('ROLE_EMPLOYEE')) {
             throw $this->createAccessDeniedException('No tienes permiso para eliminar reservas.');
        }

        $em->remove($reservation);
        $em->flush();

        // Consider sending a cancellation email

        return $this->json(['message' => 'Reserva eliminada'], \Symfony\Component\HttpFoundation\Response::HTTP_NO_CONTENT);
    }
}
