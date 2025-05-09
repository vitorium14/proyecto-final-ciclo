<?php

namespace App\Controller;

use App\Entity\RoomType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\Image;
final class RoomTypeController extends AbstractController
{
    // GET ALL ROOM TYPES
    #[Route('/room-types', name: 'get_room_types', methods: ['GET'])]
    public function getRoomTypes(EntityManagerInterface $entityManager): JsonResponse
    {
        $roomTypes = $entityManager->getRepository(RoomType::class)->findAll(); 
        return $this->json($roomTypes, Response::HTTP_OK, [], ['groups' => ['room_type']]);
    }

    // GET ROOM TYPE BY ID
    #[Route('/room-types/{id}', name: 'get_room_type_by_id', methods: ['GET'])]
    public function getRoomTypeById(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $roomType = $entityManager->getRepository(RoomType::class)->find($id);
        return $this->json($roomType, Response::HTTP_OK, [], ['groups' => ['room_type']]);
    }

    // CREATE ROOM TYPE
    #[Route('/room-types', name: 'create_room_type', methods: ['POST'])]
    public function createRoomType(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $roomType = new RoomType();

        $roomType->setName($data['name']);
        $roomType->setDescription($data['description']);
        $roomType->setPrice($data['price']);
        $roomType->setCapacity($data['capacity']);
        $roomType->setAmenities($data['amenities']);

        foreach ($data['images'] as $image) {
            $imageEntity = new Image();
            $imageEntity->setImage($image['image']);
            $roomType->addImage($imageEntity);
        }

        $entityManager->persist($roomType);
        $entityManager->flush();

        return $this->json($roomType, Response::HTTP_CREATED, [], ['groups' => ['room_type']]);
    }

    // UPDATE ROOM TYPE
    #[Route('/room-types/{id}', name: 'update_room_type', methods: ['PUT'])]
    public function updateRoomType(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $roomType = $entityManager->getRepository(RoomType::class)->find($id);

        $roomType->setName($data['name']);
        $roomType->setDescription($data['description']);
        $roomType->setPrice($data['price']);
        $roomType->setCapacity($data['capacity']);
        $roomType->setAmenities($data['amenities']);

        $roomType->getImages()->clear();

        foreach ($data['images'] as $image) {
            $imageEntity = new Image();
            $imageEntity->setImage($image['image']);
            $roomType->addImage($imageEntity);
        }

        $entityManager->flush();

        return $this->json($roomType, Response::HTTP_OK, [], ['groups' => ['room_type']]);
    }

    // DELETE ROOM TYPE
    #[Route('/room-types/{id}', name: 'delete_room_type', methods: ['DELETE'])]
    public function deleteRoomType(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $roomType = $entityManager->getRepository(RoomType::class)->find($id);
        $entityManager->remove($roomType);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
