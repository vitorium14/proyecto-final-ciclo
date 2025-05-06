<?php

namespace App\Controller;

use App\Entity\RoomType;
use App\Repository\RoomTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/room-types')]
final class RoomTypeController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private RoomTypeRepository $roomTypeRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        RoomTypeRepository $roomTypeRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->roomTypeRepository = $roomTypeRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'get_room_types', methods: ['GET'])]
    public function getAllRoomTypes(Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, min(50, (int)$request->query->get('limit', 100)));
        $search = $request->query->get('search');
        
        $queryBuilder = $this->roomTypeRepository->createQueryBuilder('rt');
        
        if ($search) {
            $queryBuilder->andWhere('rt.name LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }
        
        $totalRoomTypes = count($queryBuilder->getQuery()->getResult());
        
        $roomTypes = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        
        return $this->json([
            'room_types' => $roomTypes,
            'total' => $totalRoomTypes,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($totalRoomTypes / $limit)
        ], Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'get_room_type', methods: ['GET'])]
    public function getRoomType(int $id): JsonResponse
    {
        $roomType = $this->roomTypeRepository->find($id);
        
        if (!$roomType) {
            return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json($roomType, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('', name: 'create_room_type', methods: ['POST'])]
    public function createRoomType(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name']) || !isset($data['price'])) {
            return $this->json(['error' => 'Name and price are required'], Response::HTTP_BAD_REQUEST);
        }
        
        $roomType = new RoomType();
        $roomType->setName($data['name']);
        $roomType->setPrice($data['price']);
        
        if (isset($data['amenities'])) {
            $roomType->setAmenities($data['amenities']);
        }
        
        $errors = $this->validator->validate($roomType);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($roomType);
        $this->entityManager->flush();
        
        return $this->json($roomType, Response::HTTP_CREATED, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'update_room_type', methods: ['PUT'])]
    public function updateRoomType(int $id, Request $request): JsonResponse
    {
        $roomType = $this->roomTypeRepository->find($id);
        
        if (!$roomType) {
            return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $roomType->setName($data['name']);
        }
        
        if (isset($data['price'])) {
            $roomType->setPrice($data['price']);
        }
        
        if (isset($data['amenities'])) {
            $roomType->setAmenities($data['amenities']);
        }
        
        $errors = $this->validator->validate($roomType);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json($roomType, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'delete_room_type', methods: ['DELETE'])]
    public function deleteRoomType(int $id): JsonResponse
    {
        $roomType = $this->roomTypeRepository->find($id);
        
        if (!$roomType) {
            return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Check if the room type is in use
        if (!$roomType->getRooms()->isEmpty()) {
            return $this->json(['error' => 'Cannot delete a room type that is in use'], Response::HTTP_CONFLICT);
        }
        
        $this->entityManager->remove($roomType);
        $this->entityManager->flush();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
