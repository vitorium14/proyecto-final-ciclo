<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Reservation;
use App\Repository\RoomRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
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
                'createdAt' => $r->getCreatedAt()->format('Y-m-d H:i:s'), // Add createdAt
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
                'createdAt' => $r->getCreatedAt()->format('Y-m-d H:i:s'), // Add createdAt
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

    // --- New Public Reservation Endpoint ---

    #[Route('/public', name: 'api_reservation_public_create', methods: ['POST'])]
    public function publicCreate(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepository,
        RoomRepository $roomRepository,
        UserPasswordHasherInterface $passwordHasher,
        MailerInterface $mailer // Optional: for confirmation emails
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // --- 1. Validate Input Data ---
        $requiredFields = ['checkIn', 'checkOut', 'roomType', 'fullName', 'email', 'password'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Missing required field: {$field}"], Response::HTTP_BAD_REQUEST);
            }
        }

        // Basic email validation
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
             return $this->json(['error' => 'Invalid email format'], Response::HTTP_BAD_REQUEST);
        }

        // Basic password length (consider adding more complex rules)
        if (strlen($data['password']) < 6) {
             return $this->json(['error' => 'Password must be at least 6 characters long'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $checkIn = new \DateTime($data['checkIn']);
            $checkOut = new \DateTime($data['checkOut']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }

        if ($checkIn >= $checkOut) {
            return $this->json(['error' => 'Check-out date must be after check-in date'], Response::HTTP_BAD_REQUEST);
        }

        // --- 2. Handle User (Find or Create) ---
        $user = $userRepository->findOneBy(['email' => $data['email']]);
        $newUserCreated = false;

        if (!$user) {
            $user = new User();
            $user->setEmail($data['email']);
            $user->setFullName($data['fullName']);
            $user->setRoles(['ROLE_CLIENT']); // Assign default client role
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
            $newUserCreated = true;
            // User will be persisted within the transaction
        }

        // --- 3. Find Available Room (Simplified: Find first by type, then check availability) ---
        // TODO: Implement a more robust availability search (e.g., query for any available room of type)
        $availableRoom = null;
        $potentialRooms = $roomRepository->findBy(['type' => $data['roomType']]);

        if (empty($potentialRooms)) {
             return $this->json(['error' => 'No rooms found for the specified type'], Response::HTTP_NOT_FOUND);
        }

        foreach ($potentialRooms as $room) {
            $qb = $em->getRepository(Reservation::class)->createQueryBuilder('r');
            $qb->select('COUNT(r.id)')
               ->where('r.room = :room')
               ->andWhere('r.checkOut > :checkIn AND r.checkIn < :checkOut')
               ->setParameters(new \Doctrine\Common\Collections\ArrayCollection([
                   'room' => $room,
                   'checkIn' => $checkIn,
                   'checkOut' => $checkOut
               ]));

            $overlappingReservations = (int) $qb->getQuery()->getSingleScalarResult();

            if ($overlappingReservations === 0) {
                $availableRoom = $room;
                break; // Found an available room
            }
        }

        if (!$availableRoom) {
            return $this->json(['error' => 'No available rooms of this type found for the selected dates'], Response::HTTP_CONFLICT); // 409 Conflict
        }

        // --- 4. Create Reservation (within a transaction) ---
        $em->getConnection()->beginTransaction(); // Start transaction manually
        try {
            if ($newUserCreated) {
                $em->persist($user); // Persist the new user if created
            }

            $reservation = new Reservation();
            $reservation->setUser($user);
            $reservation->setRoom($availableRoom);
            $reservation->setCheckIn($checkIn);
            $reservation->setCheckOut($checkOut);
            $reservation->setStatus('confirmada'); // Or 'pendiente' depending on workflow
            $reservation->setCreatedAt(new \DateTimeImmutable());

            $em->persist($reservation);
            $em->flush(); // Manually flush changes

            $em->getConnection()->commit(); // Commit transaction

            // --- 5. Send Confirmation Email (Optional - outside transaction) ---
            try {
                $subject = $newUserCreated ? 'Welcome and Reservation Confirmation' : 'Reservation Confirmation';
                $text = "Hello {$user->getFullName()},\n\n";
                if ($newUserCreated) {
                    $text .= "Welcome to OrangeHotel! Your account has been created.\n";
                }
                $text .= "Your reservation details:\n" .
                         "Room Type: " . $availableRoom->getType() . "\n" .
                         "Room Number: " . $availableRoom->getNumber() . "\n" . // Display assigned room number
                         "Check-in: " . $checkIn->format('Y-m-d') . "\n" .
                         "Check-out: " . $checkOut->format('Y-m-d') . "\n\n" .
                         "Thank you for choosing OrangeHotel!";

                $email = (new Email())
                    ->from('noreply@orangehotel.com') // Use a relevant sender
                    ->to($user->getEmail())
                    ->subject($subject)
                    ->text($text);
                $mailer->send($email);
            } catch (\Exception $mailError) {
                // Log the mail error but don't fail the whole request
                // Use a proper logger in a real application
                error_log("Failed to send confirmation email: " . $mailError->getMessage());
            }


            return $this->json([
                'message' => 'Reservation created successfully!',
                'reservationId' => $reservation->getId(),
                'userId' => $user->getId(),
                'newUserCreated' => $newUserCreated
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            if ($em->getConnection()->isTransactionActive()) { // Check if transaction is active before rollback
                $em->getConnection()->rollBack(); // Rollback transaction on error
            }
            // Log the exception $e->getMessage()
            return $this->json(['error' => 'An unexpected error occurred during reservation.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
