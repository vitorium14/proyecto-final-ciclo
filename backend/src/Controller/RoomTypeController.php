<?php

namespace App\Controller;

use App\Entity\RoomType;
use App\Entity\Image;
use App\Repository\RoomTypeRepository;
use App\Repository\ImageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Service\LogService;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/room-types')]
final class RoomTypeController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private RoomTypeRepository $roomTypeRepository;
    private ImageRepository $imageRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    private LogService $logService;

    public function __construct(
        EntityManagerInterface $entityManager,
        RoomTypeRepository $roomTypeRepository,
        ImageRepository $imageRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        LogService $logService
    ) {
        $this->entityManager = $entityManager;
        $this->roomTypeRepository = $roomTypeRepository;
        $this->imageRepository = $imageRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
        $this->logService = $logService;
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
    #[IsGranted('ROLE_ADMIN')]
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
        
        // Persistir el tipo de habitación primero para poder relacionar las imágenes
        $this->entityManager->persist($roomType);
        $this->entityManager->flush();
        
        // Procesar imágenes si existen
        if (isset($data['images']) && is_array($data['images'])) {
            foreach ($data['images'] as $imageData) {
                if (isset($imageData['image']) && !empty($imageData['image'])) {
                    $image = new Image();
                    $image->setImage($imageData['image']);
                    $image->setMain(false); // Por defecto no es la imagen principal
                    $image->setRoomType($roomType);
                    
                    $this->entityManager->persist($image);
                }
            }
            $this->entityManager->flush();
        }
        
        // Crear log de la acción
        $details = sprintf(
            'Tipo de habitación "%s" creado. Precio: %s',
            $roomType->getName(),
            $roomType->getPrice()
        );
        $this->logService->createLog(
            $this->getUser(),
            'create',
            'room_type',
            $roomType->getId(),
            $details
        );
        
        return $this->json($roomType, Response::HTTP_CREATED, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'update_room_type', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateRoomType(int $id, Request $request): JsonResponse
    {
        $roomType = $this->roomTypeRepository->find($id);
        
        if (!$roomType) {
            return $this->json(['error' => 'Room type not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $oldName = $roomType->getName();
            $roomType->setName($data['name']);
        }
        
        if (isset($data['price'])) {
            $oldPrice = $roomType->getPrice();
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
        
        // Procesar imágenes si existen
        if (isset($data['images']) && is_array($data['images'])) {
            // IDs de imágenes a mantener
            $keepImageIds = [];
            
            foreach ($data['images'] as $imageData) {
                // Conservar imágenes existentes
                if (isset($imageData['id']) && !isset($imageData['isNew'])) {
                    $keepImageIds[] = $imageData['id'];
                }
                // Añadir nuevas imágenes
                elseif (isset($imageData['image']) && !empty($imageData['image']) && isset($imageData['isNew']) && $imageData['isNew']) {
                    $image = new Image();
                    $image->setImage($imageData['image']);
                    $image->setMain(false);
                    $image->setRoomType($roomType);
                    
                    $this->entityManager->persist($image);
                }
            }
            
            // Eliminar imágenes que ya no están en el listado
            foreach ($roomType->getImages() as $existingImage) {
                if (!in_array($existingImage->getId(), $keepImageIds)) {
                    $this->entityManager->remove($existingImage);
                }
            }
        }
        
        $this->entityManager->flush();
        
        // Crear log de la acción
        $changes = [];
        if (isset($oldName) && $oldName !== $roomType->getName()) {
            $changes[] = "Nombre: $oldName -> {$roomType->getName()}";
        }
        if (isset($oldPrice) && $oldPrice !== $roomType->getPrice()) {
            $changes[] = "Precio: $oldPrice -> {$roomType->getPrice()}";
        }
        if (isset($data['amenities']) && $roomType->getAmenities() !== $data['amenities']) {
            $changes[] = "Amenities actualizadas";
        }
        
        if (!empty($changes)) {
            $details = sprintf(
                'Tipo de habitación %d actualizado. Cambios: %s',
                $roomType->getId(),
                implode(', ', $changes)
            );
            $this->logService->createLog(
                $this->getUser(),
                'update',
                'room_type',
                $roomType->getId(),
                $details
            );
        }
        
        return $this->json($roomType, Response::HTTP_OK, [], ['groups' => ['room:read']]);
    }

    #[Route('/{id}', name: 'delete_room_type', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
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
        
        // Eliminar las imágenes asociadas
        foreach ($roomType->getImages() as $image) {
            $this->entityManager->remove($image);
        }
        
        $this->entityManager->remove($roomType);
        $this->entityManager->flush();
        
        // Crear log de la acción
        $details = sprintf(
            'Tipo de habitación eliminado. Nombre: %s, Precio: %s',
            $roomType->getName(),
            $roomType->getPrice()
        );
        $this->logService->createLog(
            $this->getUser(),
            'delete',
            'room_type',
            $id,
            $details
        );
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
