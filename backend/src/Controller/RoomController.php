<?php

namespace App\Controller;

use App\Entity\Room;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/rooms')]
final class RoomController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(RoomRepository $roomRepository): JsonResponse
    {
        $rooms = $roomRepository->findAll();

        $data = array_map(fn(Room $room) => [
            'id' => $room->getId(),
            'number' => $room->getNumber(),
            'type' => $room->getType(),
            'price' => $room->getPrice(),
            'status' => $room->getStatus(),
        ], $rooms);

        return $this->json($data);
    }

    // Added method to get a single room by ID
    #[Route('/{id}', methods: ['GET'])]
    public function show(Room $room): JsonResponse
    {
        // Assuming Room entity has methods to get details
        $data = [
            'id' => $room->getId(),
            'number' => $room->getNumber(),
            'type' => $room->getType(),
            'price' => $room->getPrice(),
            'status' => $room->getStatus(),
            // Add other relevant fields if necessary
        ];
        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $room = new Room();
        $room->setNumber($data['number']);
        $room->setType($data['type']);
        $room->setPrice($data['price']);
        $room->setStatus($data['status']);

        $em->persist($room);
        $em->flush();

        return $this->json(['message' => 'Room created', 'id' => $room->getId()], 201);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function update(Room $room, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['number'])) {
            $room->setNumber($data['number']);
        }

        if (isset($data['type'])) {
            $room->setType($data['type']);
        }

        if (isset($data['price'])) {
            $room->setPrice($data['price']);
        }

        if (isset($data['status'])) {
            $room->setStatus($data['status']);
        }

        $em->flush();

        return $this->json(['message' => 'Room updated']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function delete(Room $room, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($room);
        $em->flush();

        return $this->json(['message' => 'Room deleted'], Response::HTTP_NO_CONTENT);
    }
}
