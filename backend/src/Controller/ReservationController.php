<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Reservation;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reservations')]
final class ReservationController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        RoomRepository $roomRepository,
        EntityManagerInterface $em,
        #[CurrentUser] ?User $user
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
        if (!$this->isGranted('ROLE_RECEPTIONIST') && !$this->isGranted('ROLE_ADMIN')) {
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
}
