<?php

namespace App\Controller;

use App\Entity\Service;
use App\Repository\ServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/services')]
final class ServiceController extends AbstractController
{
    // List all services (Public or Employee?) - Let's make it public for now
    #[Route('', methods: ['GET'])]
    public function index(ServiceRepository $serviceRepository): JsonResponse
    {
        $services = $serviceRepository->findAll();
        // Consider using serialization groups if output needs customization
        return $this->json($services);
    }

    // Create a new service - Employee/Admin only
    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Basic validation
        if (!isset($data['name']) || !isset($data['price'])) {
            return $this->json(['error' => 'Missing required fields: name, price'], Response::HTTP_BAD_REQUEST);
        }

        $service = new Service();
        $service->setName($data['name']);
        $service->setPrice((float)$data['price']); // Ensure price is float
        if (isset($data['description'])) {
            $service->setDescription($data['description']);
        }
        // Set duration, category, image (handle potential missing keys)
        if (isset($data['duration'])) {
            $service->setDuration((int)$data['duration']); // Cast to int
        }
        if (isset($data['category'])) {
            $service->setCategory($data['category']);
        }
        if (isset($data['image'])) {
            $service->setImage($data['image']);
        }

        $em->persist($service);
        $em->flush();

        return $this->json(['message' => 'Service created', 'id' => $service->getId()], Response::HTTP_CREATED);
    }

    // Get a single service by ID (Public or Employee?) - Let's make it public for now
    #[Route('/{id}', methods: ['GET'])]
    public function show(Service $service): JsonResponse
    {
        // Parameter converter handles finding the service or 404
        return $this->json($service);
    }

    // Update a service - Employee/Admin only
    #[Route('/{id}', methods: ['PATCH'])]
    public function update(Service $service, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $service->setName($data['name']);
        }
        if (isset($data['price'])) {
            $service->setPrice((float)$data['price']);
        }
        if (array_key_exists('description', $data)) { // Allow setting description to null/empty
            $service->setDescription($data['description']);
        }
        // Update duration, category, image if provided
        if (isset($data['duration'])) {
            $service->setDuration((int)$data['duration']);
        }
        if (array_key_exists('category', $data)) { // Allow setting category to null/empty
            $service->setCategory($data['category']);
        }
        if (array_key_exists('image', $data)) { // Allow setting image to null/empty
            $service->setImage($data['image']);
        }

        $em->flush();

        // Return the updated service object
        return $this->json($service);
    }

    // Delete a service - Employee/Admin only
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        // Consider checking if service is associated with active reservations before deleting?

        $em->remove($service);
        $em->flush();

        return $this->json(['message' => 'Service deleted'], Response::HTTP_NO_CONTENT);
    }
}