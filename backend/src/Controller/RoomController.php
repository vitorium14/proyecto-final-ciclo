<?php

namespace App\Controller;

use App\Entity\Room;
use App\Entity\RoomType;
use App\Repository\RoomRepository;
use App\Repository\RoomTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/rooms')]
final class RoomController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private RoomRepository $roomRepository;
    private RoomTypeRepository $roomTypeRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        RoomRepository $roomRepository,
        RoomTypeRepository $roomTypeRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->roomRepository = $roomRepository;
        $this->roomTypeRepository = $roomTypeRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'get_rooms', methods: ['GET'])]
    public function getAllRooms(Request $request): JsonResponse
    {
        $status = $request->query->get('status');
        $roomTypeId = $request->query->get('roomTypeId');
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, min(50, (int)$request->query->get('limit', 10)));
        $search = $request->query->get('search');
        
        $queryBuilder = $this->roomRepository->createQueryBuilder('r')
            ->leftJoin('r.roomType', 'rt')
            ->addSelect('rt');
        
        if ($status) {
            $queryBuilder->andWhere('r.status = :status')
                ->setParameter('status', $status);
        }
        
        if ($roomTypeId) {
            $queryBuilder->andWhere('rt.id = :roomTypeId')
                ->setParameter('roomTypeId', $roomTypeId);
        }
        
        if ($search) {
            $queryBuilder->andWhere('r.number LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }
        
        $totalRooms = count($queryBuilder->getQuery()->getResult());
        
        $rooms = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        
        return $this->json([
            'rooms' => $rooms,
            'total' => $totalRooms,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($totalRooms / $limit)
        ], Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'get_room', methods: ['GET'])]
    public function getRoom(int $id): JsonResponse
    {
        $room = $this->roomRepository->find($id);
        
        if (!$room) {
            return $this->json(['error' => 'Room not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('', name: 'create_room', methods: ['POST'])]
    public function createRoom(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['number'])) {
            return $this->json(['error' => 'Room number is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['roomType'])) {
            return $this->json(['error' => 'Room type is required'], Response::HTTP_BAD_REQUEST);
        }
        
        // Extract room type ID from IRI string like '/api/room_types/1'
        $roomTypeId = null;
        if (is_string($data['roomType']) && preg_match('~/api/room_types/(\d+)~', $data['roomType'], $matches)) {
            $roomTypeId = (int)$matches[1];
        } elseif (is_array($data['roomType']) && isset($data['roomType']['id'])) {
            $roomTypeId = (int)$data['roomType']['id'];
        }
        
        if (!$roomTypeId) {
            return $this->json(['error' => 'Invalid room type provided'], Response::HTTP_BAD_REQUEST);
        }

        $roomType = $this->roomTypeRepository->find($roomTypeId);
        if (!$roomType) {
            return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Check if room number already exists
        $existingRoom = $this->roomRepository->findOneBy(['number' => $data['number']]);
        if ($existingRoom) {
            return $this->json(['error' => 'Room number already exists'], Response::HTTP_CONFLICT);
        }
        
        $room = new Room();
        $room->setNumber($data['number']);
        $room->setRoomType($roomType);
        
        if (isset($data['status'])) {
            $room->setStatus($data['status']);
        }
        
        $errors = $this->validator->validate($room);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($room);
        $this->entityManager->flush();
        
        return $this->json($room, Response::HTTP_CREATED, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'update_room', methods: ['PUT'])]
    public function updateRoom(int $id, Request $request): JsonResponse
    {
        $room = $this->roomRepository->find($id);
        
        if (!$room) {
            return $this->json(['error' => 'Room not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['number']) && $data['number'] !== $room->getNumber()) {
            // Check if room number already exists
            $existingRoom = $this->roomRepository->findOneBy(['number' => $data['number']]);
            if ($existingRoom && $existingRoom->getId() !== $id) {
                return $this->json(['error' => 'Room number already exists'], Response::HTTP_CONFLICT);
            }
            $room->setNumber($data['number']);
        }
        
        if (isset($data['roomType'])) {
            // Extract room type ID from IRI string like '/api/room_types/1'
            $roomTypeId = null;
            if (is_string($data['roomType']) && preg_match('~/api/room_types/(\d+)~', $data['roomType'], $matches)) {
                $roomTypeId = (int)$matches[1];
            } elseif (is_array($data['roomType']) && isset($data['roomType']['id'])) {
                $roomTypeId = (int)$data['roomType']['id'];
            }
            
            if ($roomTypeId) {
                $roomType = $this->roomTypeRepository->find($roomTypeId);
                if (!$roomType) {
                    return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
                }
                $room->setRoomType($roomType);
            }
        }
        
        if (isset($data['status'])) {
            $room->setStatus($data['status']);
        }
        
        $errors = $this->validator->validate($room);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'delete_room', methods: ['DELETE'])]
    public function deleteRoom(int $id): JsonResponse
    {
        $room = $this->roomRepository->find($id);
        
        if (!$room) {
            return $this->json(['error' => 'Room not found'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($room);
        $this->entityManager->flush();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/status/{id}', name: 'update_room_status', methods: ['PATCH'])]
    public function updateRoomStatus(int $id, Request $request): JsonResponse
    {
        $room = $this->roomRepository->find($id);
        
        if (!$room) {
            return $this->json(['error' => 'Room not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['status'])) {
            return $this->json(['error' => 'Status is required'], Response::HTTP_BAD_REQUEST);
        }
        
        $room->setStatus($data['status']);
        
        $errors = $this->validator->validate($room);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json($room, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }
}
