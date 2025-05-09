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

final class RoomController extends AbstractController
{
    // GET ALL ROOMS
    #[Route('/rooms', name: 'get_rooms', methods: ['GET'])]
    public function getRooms(EntityManagerInterface $entityManager): JsonResponse
    {
        $rooms = $entityManager->getRepository(Room::class)->findAll();
        return $this->json($rooms, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // GET ROOM BY ID
    #[Route('/rooms/{id}', name: 'get_room_by_id', methods: ['GET'])]
    public function getRoomById(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $room = $entityManager->getRepository(Room::class)->find($id);
        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // CREATE ROOM
    #[Route('/rooms', name: 'create_room', methods: ['POST'])]
    public function createRoom(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
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
    public function updateRoom(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $room = $entityManager->getRepository(Room::class)->find($id);
        $room->setName($data['name']);
        $room->setType($entityManager->getRepository(RoomType::class)->find($data['type']));
        $room->setStatus($data['status']);
        $room->setObservations($data['observations']);

        $entityManager->flush();

        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room']]);
    }

    // DELETE ROOM
    #[Route('/rooms/{id}', name: 'delete_room', methods: ['DELETE'])]
    public function deleteRoom(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $room = $entityManager->getRepository(Room::class)->find($id);
        $entityManager->remove($room);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // AVAIABLE ROOMS BY DATE RANGE
    #[Route('/rooms/available', name: 'get_available_rooms', methods: ['GET'])]
    public function getAvailableRooms(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $startDate = $data['startDate'];
        $endDate = $data['endDate'];

        $rooms = $entityManager->getRepository(Room::class)->findAll();
        $availableRooms = [];

        foreach ($rooms as $room) {
            $bookings = $room->getBookings();
            $isAvailable = true;
            foreach ($bookings as $booking) {
                if ($booking->getCheckIn() <= $endDate && $booking->getCheckOut() >= $startDate) {
                    $isAvailable = false;
                }
            }
            if ($isAvailable) {
                $availableRooms[] = $room;
            }
        }
        return $this->json($availableRooms, Response::HTTP_OK, [], ['groups' => ['room']]);
    }
}
