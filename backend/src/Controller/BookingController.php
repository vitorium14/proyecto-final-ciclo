<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Booking;
use App\Entity\Service;
use App\Entity\User;
use App\Entity\Room;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\JwtService;

#[Route('/api')]
final class BookingController extends AbstractController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }
    // GET ALL BOOKINGS
    #[Route('/bookings', name: 'get_bookings', methods: ['GET'])]
    public function getBookings(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // CHECK IF USER IS ADMIN OR EMPLOYEE
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $bookings = $entityManager->getRepository(Booking::class)->findAll();
        return $this->json($bookings, Response::HTTP_OK, [], ['groups' => ['booking']]);
    }

    // GET BOOKING BY ID
    #[Route('/bookings/{id}', name: 'get_booking_by_id', methods: ['GET'])]
    public function getBookingById(Request $request, EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $booking = $entityManager->getRepository(Booking::class)->find($id);

        // CHECK IF USER IS ADMIN OR EMPLOYEE OR USER BOOKING
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin && $booking->getUser()->getId() !== $this->jwtService->getUserId($request->headers->get('Authorization'), $entityManager)) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($booking, Response::HTTP_OK, [], ['groups' => ['booking']]);
    }

    // GET BOOKINGS BY USER ID
    #[Route('/bookings/user/{id}', name: 'get_bookings_by_user_id', methods: ['GET'])]
    public function getBookingsByUserId(Request $request, EntityManagerInterface $entityManager, int $id): JsonResponse
    {

        $bookings = $entityManager->getRepository(Booking::class)->findBy(['user' => $id]);

        if (!$bookings) {
            return $this->json([], Response::HTTP_OK);
        }

        // CHECK IF USER IS ADMIN OR EMPLOYEE OR USER BOOKING
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin && $bookings[0]->getUser()->getId() !== $this->jwtService->getUserId($request->headers->get('Authorization'), $entityManager)) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($bookings, Response::HTTP_OK, [], ['groups' => ['booking']]);
    }

    // CREATE BOOKING
    #[Route('/bookings', name: 'create_booking', methods: ['POST'])]
    public function createBooking(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $booking = new Booking();
        $booking->setUser($entityManager->getRepository(User::class)->find($data['user']));

        foreach ($data['services'] as $service) {
            $serviceEntity = $entityManager->getRepository(Service::class)->find($service);
            if ($serviceEntity) {
                $booking->addService($serviceEntity);
            }else{
                return $this->json(['error' => 'Service not found'], Response::HTTP_BAD_REQUEST);
            }
        }

        $booking->setCheckIn($data['checkIn']);
        $booking->setCheckOut($data['checkOut']);
        $booking->setCheckedIn($data['checkedIn']);
        $booking->setCheckedOut($data['checkedOut']);
        $booking->setRoom($entityManager->getRepository(Room::class)->find($data['room']));

        // Calculate price based on services & stay duration * room type price
        $price = 0;
        foreach ($booking->getServices() as $service) {
            $price += $service->getPrice();
        }

        $room = $entityManager->getRepository(Room::class)->find($data['room']);
        $price += $room->getType()->getPrice() * $data['duration'];

        $booking->setPrice($price);

        $entityManager->persist($booking);
        $entityManager->flush();

        return $this->json($booking, Response::HTTP_CREATED, [], ['groups' => ['booking']]);
    }

    // UPDATE BOOKING
    #[Route('/bookings/{id}', name: 'update_booking', methods: ['PUT'])]
    public function updateBooking(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $booking = $entityManager->getRepository(Booking::class)->find($id);

        $booking->setUser($entityManager->getRepository(User::class)->find($data['user']));

        $booking->getServices()->clear();
        
        foreach ($data['services'] as $service) {
            $serviceEntity = $entityManager->getRepository(Service::class)->find($service);
            if ($serviceEntity) {
                $booking->addService($serviceEntity);
            }else{
                return $this->json(['error' => 'Service not found'], Response::HTTP_BAD_REQUEST);
            }
        }

        $booking->setCheckIn($data['checkIn']);
        $booking->setCheckOut($data['checkOut']);
        $booking->setCheckedIn($data['checkedIn']);
        $booking->setCheckedOut($data['checkedOut']);
        $booking->setRoom($entityManager->getRepository(Room::class)->find($data['room']));

        // Calculate price based on services & stay duration * room type price
        $price = 0;
        foreach ($booking->getServices() as $service) {
            $price += $service->getPrice();
        }

        $room = $entityManager->getRepository(Room::class)->find($data['room']);
        $price += $room->getType()->getPrice() * $data['duration'];

        $booking->setPrice($price);
        
        $entityManager->flush();

        return $this->json($booking, Response::HTTP_OK, [], ['groups' => ['booking']]);
    }

    // DELETE BOOKING
    #[Route('/bookings/{id}', name: 'delete_booking', methods: ['DELETE'])]
    public function deleteBooking(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $booking = $entityManager->getRepository(Booking::class)->find($id);
        $entityManager->remove($booking);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
