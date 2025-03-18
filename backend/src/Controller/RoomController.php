<?php

namespace App\Controller;

use App\Entity\Room;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class RoomController extends AbstractController
{
    #[Route('/room', name: 'app_room', methods: ['GET'])]
    public function getAllRooms(EntityManagerInterface $entityManager): JsonResponse
    {
        $rooms = $entityManager->getRepository(Room::class)->findAll();
        return $this->json($rooms);
    }

    #[Route('/room', name: 'app_room_create', methods: ['POST'])]
    public function postRoom(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $requestContent = json_decode($request->getContent(), true);

        $room = new Room();

        $room->setNumber($requestContent['number']);
        $room->setType($requestContent['type']);
        $room->setPrice($requestContent['price']);
        $room->setStatus($requestContent['status']);
        $room->setCapacity($requestContent['capacity']);
        $room->setDescription($requestContent['description']);

        $entityManager->persist($room);
        $entityManager->flush();

        return $this->json(['Status' => '200', 'Message' => 'Room created'], Response::HTTP_OK);
    }

    #[Route('/room/{id}', name: 'app_room_delete', methods: ['DELETE'])]
    public function deleteRoom(EntityManagerInterface $entityManager, Room $room): JsonResponse
    {
        $entityManager->remove($room);
        $entityManager->flush();
        return $this->json(['Status' => '200', 'Message' => 'Room deleted'], Response::HTTP_OK);
    }
}
