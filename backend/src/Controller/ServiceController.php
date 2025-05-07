<?php

namespace App\Controller;

use App\Entity\Service;
use App\Repository\ServiceRepository;
use App\Service\LogService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/services')]
final class ServiceController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private ServiceRepository $serviceRepository;
    private SerializerInterface $serializer;
    private ValidatorInterface $validator;
    private LogService $logService;

    public function __construct(
        EntityManagerInterface $entityManager,
        ServiceRepository $serviceRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        LogService $logService
    ) {
        $this->entityManager = $entityManager;
        $this->serviceRepository = $serviceRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('', name: 'get_services', methods: ['GET'])]
    public function getAllServices(Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, min(50, (int)$request->query->get('limit', 10)));
        $search = $request->query->get('search');
        $category = $request->query->get('category');
        $status = $request->query->get('status');
        
        $queryBuilder = $this->serviceRepository->createQueryBuilder('s');
        
        if ($search) {
            $queryBuilder->andWhere('s.name LIKE :search OR s.description LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }
        
        if ($category) {
            $queryBuilder->andWhere('s.category = :category')
                ->setParameter('category', $category);
        }
        
        if ($status) {
            $queryBuilder->andWhere('s.status = :status')
                ->setParameter('status', $status);
        }
        
        $totalServices = count($queryBuilder->getQuery()->getResult());
        
        $services = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        
        return $this->json([
            'services' => $services,
            'total' => $totalServices,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($totalServices / $limit)
        ], Response::HTTP_OK, [], ['groups' => ['service:read']]);
    }

    #[Route('/{id}', name: 'get_service', methods: ['GET'])]
    public function getService(int $id): JsonResponse
    {
        $service = $this->serviceRepository->find($id);
        
        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json($service, Response::HTTP_OK, [], ['groups' => ['service:read']]);
    }

    #[Route('', name: 'create_service', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createService(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name']) || !isset($data['price']) || !isset($data['category'])) {
            return $this->json(['error' => 'Name, price and category are required'], Response::HTTP_BAD_REQUEST);
        }
        
        $service = new Service();
        $service->setName($data['name']);
        $service->setPrice($data['price']);
        $service->setCategory($data['category']);
        
        if (isset($data['description'])) {
            $service->setDescription($data['description']);
        }
        
        if (isset($data['status'])) {
            $service->setStatus($data['status']);
        }
        
        $errors = $this->validator->validate($service);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($service);
        $this->entityManager->flush();
        
        return $this->json($service, Response::HTTP_CREATED, [], ['groups' => ['service:read']]);
    }

    #[Route('/{id}', name: 'update_service', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateService(int $id, Request $request): JsonResponse
    {
        $service = $this->serviceRepository->find($id);
        
        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $service->setName($data['name']);
        }
        
        if (isset($data['price'])) {
            $service->setPrice($data['price']);
        }
        
        if (isset($data['category'])) {
            $service->setCategory($data['category']);
        }
        
        if (isset($data['description'])) {
            $service->setDescription($data['description']);
        }
        
        if (isset($data['status'])) {
            $service->setStatus($data['status']);
        }
        
        $errors = $this->validator->validate($service);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json($service, Response::HTTP_OK, [], ['groups' => ['service:read']]);
    }

    #[Route('/{id}', name: 'delete_service', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteService(int $id): JsonResponse
    {
        $service = $this->serviceRepository->find($id);
        
        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Check if the service is in use (you might want to add this check based on your business logic)
        // For example, if services are linked to bookings or reservations
        
        $this->entityManager->remove($service);
        $this->entityManager->flush();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/status', name: 'update_service_status', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateServiceStatus(int $id, Request $request): JsonResponse
    {
        $service = $this->serviceRepository->find($id);
        
        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['status'])) {
            return $this->json(['error' => 'Status is required'], Response::HTTP_BAD_REQUEST);
        }
        
        $service->setStatus($data['status']);
        
        $errors = $this->validator->validate($service);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        return $this->json($service, Response::HTTP_OK, [], ['groups' => ['service:read']]);
    }
} 