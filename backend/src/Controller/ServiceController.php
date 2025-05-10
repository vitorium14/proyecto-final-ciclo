<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Service;
use App\Entity\Image;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\JwtService;

#[Route('/api')]
final class ServiceController extends AbstractController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    // GET ALL SERVICES
    #[Route('/services', name: 'get_services', methods: ['GET'])]
    public function getServices(EntityManagerInterface $entityManager): JsonResponse
    {
        $services = $entityManager->getRepository(Service::class)->findAll();
        return $this->json($services, Response::HTTP_OK, [], ['groups' => ['service']]);
    }

    // GET SERVICE BY ID
    #[Route('/services/{id}', name: 'get_service_by_id', methods: ['GET'])]
    public function getServiceById(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $service = $entityManager->getRepository(Service::class)->find($id);
        return $this->json($service, Response::HTTP_OK, [], ['groups' => ['service', 'image']]);
    }

    // CREATE SERVICE
    #[Route('/services', name: 'create_service', methods: ['POST'])]
    public function createService(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $service = new Service();
        $service->setName($data['name']);
        $service->setDescription($data['description']);
        $service->setPrice($data['price']);
        $service->setDuration($data['duration']);
        
        foreach ($data['images'] as $image) {
            $imageEntity = new Image();
            $imageEntity->setImage($image['image']);
            $service->addImage($imageEntity);
        }

        $entityManager->persist($service);
        $entityManager->flush();

        return $this->json($service, Response::HTTP_CREATED, [], ['groups' => ['service']]);
    }

    // UPDATE SERVICE
    #[Route('/services/{id}', name: 'update_service', methods: ['PUT'])]
    public function updateService(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $service = $entityManager->getRepository(Service::class)->find($id);
        $service->setName($data['name']);
        $service->setDescription($data['description']);
        $service->setPrice($data['price']);
        $service->setDuration($data['duration']);

        $service->getImages()->clear();
        
        foreach ($data['images'] as $image) {
            $imageEntity = new Image();
            $imageEntity->setImage($image['image']);
            $service->addImage($imageEntity);
        }

        $entityManager->flush();

        return $this->json($service, Response::HTTP_OK, [], ['groups' => ['service']]);
    }

    // DELETE SERVICE
    #[Route('/services/{id}', name: 'delete_service', methods: ['DELETE'])]
    public function deleteService(Request $request, EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $service = $entityManager->getRepository(Service::class)->find($id);
        $entityManager->remove($service);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
