<?php

namespace App\DataFixtures;

use App\Entity\Room;
use App\Entity\RoomType;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class RoomFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Create room types
        $roomTypes = [
            [
                'name' => 'Individual',
                'price' => '50.00',
                'amenities' => 'Cama individual, baño privado, TV, WiFi'
            ],
            [
                'name' => 'Doble',
                'price' => '75.00',
                'amenities' => 'Cama doble, baño privado, TV, WiFi, nevera pequeña'
            ],
            [
                'name' => 'Suite',
                'price' => '120.00',
                'amenities' => 'Cama king size, baño con jacuzzi, TV, WiFi, minibar, sala de estar'
            ],
            [
                'name' => 'Familiar',
                'price' => '100.00',
                'amenities' => 'Dos camas dobles, baño privado, TV, WiFi, nevera'
            ]
        ];

        $createdRoomTypes = [];

        foreach ($roomTypes as $roomTypeData) {
            $roomType = new RoomType();
            $roomType->setName($roomTypeData['name']);
            $roomType->setPrice($roomTypeData['price']);
            $roomType->setAmenities($roomTypeData['amenities']);

            $manager->persist($roomType);
            $createdRoomTypes[] = $roomType;
        }
        
        $manager->flush();

        // Create rooms
        $roomsByType = [
            // Individual rooms (first floor)
            0 => ['101', '102', '103', '104', '105'],
            // Double rooms (second floor)
            1 => ['201', '202', '203', '204', '205'],
            // Suites (third floor)
            2 => ['301', '302', '303'],
            // Family rooms (fourth floor)
            3 => ['401', '402', '403', '404']
        ];

        $roomStatuses = [
            Room::STATUS_AVAILABLE,
            Room::STATUS_OCCUPIED,
            Room::STATUS_CLEANING,
            Room::STATUS_MAINTENANCE
        ];

        foreach ($roomsByType as $typeIndex => $roomNumbers) {
            foreach ($roomNumbers as $roomNumber) {
                $room = new Room();
                $room->setNumber($roomNumber);
                $room->setRoomType($createdRoomTypes[$typeIndex]);
                
                // Set random status, mostly available
                $randomIndex = mt_rand(0, 100) < 70 ? 0 : mt_rand(0, count($roomStatuses) - 1);
                $room->setStatus($roomStatuses[$randomIndex]);
                
                $manager->persist($room);
            }
        }

        $manager->flush();
    }
} 