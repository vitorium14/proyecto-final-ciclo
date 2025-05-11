<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Room;
use App\Entity\RoomType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\JwtService;

#[Route('/api')]
final class RoomController extends AbstractController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    // GET ALL ROOMS
    #[Route('/rooms', name: 'get_rooms', methods: ['GET'])]
    public function getRooms(EntityManagerInterface $entityManager): JsonResponse
    {
        $rooms = $entityManager->getRepository(Room::class)->findAll();
        return $this->json($rooms, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // AVAILABLE ROOMS BY DATE RANGE
    #[Route('/rooms/available', name: 'get_available_rooms', methods: ['GET'])]
    public function getAvailableRooms(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $startDateStr = $request->query->get('startDate');
        $endDateStr = $request->query->get('endDate');

        if (!$startDateStr || !$endDateStr) {
            return $this->json([
                'status_code' => Response::HTTP_BAD_REQUEST,
                'message' => 'Los parámetros query startDate y endDate son requeridos.'
            ], Response::HTTP_BAD_REQUEST);
        }

        $startDateObj = new \DateTime($startDateStr);
        $endDateObj = new \DateTime($endDateStr);

        if ($startDateObj > $endDateObj) {
            return $this->json([
                'status_code' => Response::HTTP_BAD_REQUEST,
                'message' => 'startDate no puede ser posterior a endDate.'
            ], Response::HTTP_BAD_REQUEST);
        }

        // It's better to work with DateTime objects for comparison
        // Assuming $booking->getCheckIn() and $booking->getCheckOut() return DateTime objects or strings that can be reliably converted.

        $rooms = $entityManager->getRepository(Room::class)->findAll();
        $availableRooms = [];

        foreach ($rooms as $room) {
            $isAvailable = true;
            foreach ($room->getBookings() as $booking) {
                // Ensure booking dates are also DateTime objects for accurate comparison
                $bookingCheckIn = $booking->getCheckIn(); // Assuming this is already DateTime or YYYY-MM-DD string
                $bookingCheckOut = $booking->getCheckOut(); // Assuming this is already DateTime or YYYY-MM-DD string

                // If they are strings, convert them. For this example, let's assume they are strings and convert.
                // In a real scenario, entities should consistently return DateTime objects for date fields.
                $_bookingCheckInDate = ($bookingCheckIn instanceof \DateTimeInterface) ? $bookingCheckIn : \DateTime::createFromFormat($dateFormat, (string) $bookingCheckIn);
                $_bookingCheckOutDate = ($bookingCheckOut instanceof \DateTimeInterface) ? $bookingCheckOut : \DateTime::createFromFormat($dateFormat, (string) $bookingCheckOut);

                if (!$_bookingCheckInDate || !$_bookingCheckOutDate) {
                    // Handle error or skip this booking if dates are invalid
                    // Potentially log this issue
                    continue;
                }

                // The room is unavailable if a booking overlaps with the requested range.
                // Overlap condition: (BookingStart < RequestedEnd) and (BookingEnd > RequestedStart)
                if ($_bookingCheckInDate < $endDateObj && $_bookingCheckOutDate > $startDateObj) {
                    $isAvailable = false;
                    break; // Room is not available, no need to check other bookings for this room
                }
            }
            if ($isAvailable) {
                $availableRooms[] = $room;
            }
        }
        return $this->json($availableRooms, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // CHECK AVAILABILITY BY ROOM TYPE
    #[Route('/rooms/availability-by-type/{roomTypeId}', name: 'check_room_type_availability', methods: ['GET'])]
    public function checkRoomTypeAvailability(EntityManagerInterface $entityManager, Request $request, int $roomTypeId): JsonResponse
    {
        $startDateStr = $request->query->get('startDate');
        $endDateStr = $request->query->get('endDate');

        if (!$startDateStr || !$endDateStr) {
            return $this->json([
                'status_code' => Response::HTTP_BAD_REQUEST,
                'message' => 'Los parámetros query startDate y endDate son requeridos.'
            ], Response::HTTP_BAD_REQUEST);
        }

        $startDateObj = new \DateTime($startDateStr);
        $endDateObj = new \DateTime($endDateStr);

        if ($startDateObj > $endDateObj) {
            return $this->json([
                'status_code' => Response::HTTP_BAD_REQUEST,
                'message' => 'startDate no puede ser posterior a endDate.'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Buscar el tipo de habitación
        $roomType = $entityManager->getRepository(RoomType::class)->find($roomTypeId);
        if (!$roomType) {
            return $this->json([
                'status_code' => Response::HTTP_NOT_FOUND,
                'message' => 'Tipo de habitación no encontrado.'
            ], Response::HTTP_NOT_FOUND);
        }

        // Buscar todas las habitaciones de ese tipo
        $rooms = $entityManager->getRepository(Room::class)->findBy(['type' => $roomType]);
        $availableRooms = [];

        foreach ($rooms as $room) {
            $isAvailable = true;
            foreach ($room->getBookings() as $booking) {
                $bookingCheckIn = $booking->getCheckIn();
                $bookingCheckOut = $booking->getCheckOut();

                // The room is unavailable if a booking overlaps with the requested range.
                if ($bookingCheckIn < $endDateObj && $bookingCheckOut > $startDateObj) {
                    $isAvailable = false;
                    break;
                }
            }
            if ($isAvailable) {
                $availableRooms[] = $room;
            }
        }

        // Comprobar si hay disponibilidad
        $hasAvailability = count($availableRooms) > 0;

        return $this->json([
            'hasAvailability' => $hasAvailability,
            'availableCount' => count($availableRooms),
            'roomType' => $roomType
        ], Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // GET ROOM BY ID
    #[Route('/rooms/{id}', name: 'get_room_by_id', methods: ['GET'])]
    public function getRoomById(EntityManagerInterface $entityManager, $id): JsonResponse
    {
        $room = $entityManager->getRepository(Room::class)->find((int)$id);
        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // CREATE ROOM
    #[Route('/rooms', name: 'create_room', methods: ['POST'])]
    public function createRoom(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $room = new Room();
        $room->setName($data['name']);
        $room->setType($entityManager->getRepository(RoomType::class)->find($data['type']));
        $room->setStatus($data['status']);
        $room->setObservations($data['observations']);

        $entityManager->persist($room);
        $entityManager->flush();

        return $this->json($room, Response::HTTP_CREATED, [], ['groups' => ['room']]);
    }

    // UPDATE ROOM
    #[Route('/rooms/{id}', name: 'update_room', methods: ['PUT'])]
    public function updateRoom(EntityManagerInterface $entityManager, Request $request, $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $room = $entityManager->getRepository(Room::class)->find((int)$id);
        $room->setName($data['name']);
        $room->setType($entityManager->getRepository(RoomType::class)->find($data['type']));
        $room->setStatus($data['status']);
        $room->setObservations($data['observations']);

        $entityManager->flush();

        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // DELETE ROOM
    #[Route('/rooms/{id}', name: 'delete_room', methods: ['DELETE'])]
    public function deleteRoom(Request $request, EntityManagerInterface $entityManager, $id): JsonResponse
    {
        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $room = $entityManager->getRepository(Room::class)->find((int)$id);
        $entityManager->remove($room);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
