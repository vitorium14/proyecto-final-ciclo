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

final class BookingController extends AbstractController
{
    // GET ALL BOOKINGS
    #[Route('/bookings', name: 'get_bookings', methods: ['GET'])]
    public function getBookings(EntityManagerInterface $entityManager): JsonResponse
    {
        $bookings = $entityManager->getRepository(Booking::class)->findAll();
        return $this->json($bookings, Response::HTTP_OK, [], ['groups' => ['booking']]);
    }

    // GET BOOKING BY ID
    #[Route('/bookings/{id}', name: 'get_booking_by_id', methods: ['GET'])]
    public function getBookingById(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $booking = $entityManager->getRepository(Booking::class)->find($id);
        return $this->json($booking, Response::HTTP_OK, [], ['groups' => ['booking']]);
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
            $booking->addService($serviceEntity);
        }

        $booking->setCheckIn($data['checkIn']);
        $booking->setCheckOut($data['checkOut']);
        $booking->setCheckedIn($data['checkedIn']);
        $booking->setCheckedOut($data['checkedOut']);
        $booking->setRoom($entityManager->getRepository(Room::class)->find($data['room']));

        // Calculate price based on services & stay duration * room type price
        $price = 0;
        foreach ($data['services'] as $service) {
            $price += $service['price'];
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

        foreach ($data['services'] as $service) {
            $serviceEntity = $entityManager->getRepository(Service::class)->find($service);
            $booking->addService($serviceEntity);
        }

        $booking->setCheckIn($data['checkIn']);
        $booking->setCheckOut($data['checkOut']);
        $booking->setCheckedIn($data['checkedIn']);
        $booking->setCheckedOut($data['checkedOut']);
        $booking->setRoom($entityManager->getRepository(Room::class)->find($data['room']));

        // Calculate price based on services & stay duration * room type price
        $price = 0;
        foreach ($data['services'] as $service) {
            $price += $service['price'];
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
