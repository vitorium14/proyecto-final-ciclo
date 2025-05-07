<?php

namespace App\Repository;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use DateTime;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

//    /**
//     * @return Reservation[] Returns an array of Reservation objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Reservation
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

    /**
     * Verifica si una habitación está disponible para un rango de fechas específico
     * 
     * @param int $roomId ID de la habitación
     * @param DateTime $checkIn Fecha de entrada
     * @param DateTime $checkOut Fecha de salida
     * @param int|null $excludeReservationId ID de la reserva a excluir (útil para actualizaciones)
     * @return bool
     */
    public function isRoomAvailable(int $roomId, DateTime $checkIn, DateTime $checkOut, ?int $excludeReservationId = null): bool
    {
        $qb = $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.room = :roomId')
            ->andWhere('
                (r.checkIn <= :checkIn AND r.checkOut > :checkIn) OR
                (r.checkIn < :checkOut AND r.checkOut >= :checkOut) OR
                (r.checkIn >= :checkIn AND r.checkOut <= :checkOut)
            ')
            ->setParameter('roomId', $roomId)
            ->setParameter('checkIn', $checkIn)
            ->setParameter('checkOut', $checkOut);

        if ($excludeReservationId) {
            $qb->andWhere('r.id != :excludeReservationId')
                ->setParameter('excludeReservationId', $excludeReservationId);
        }

        $count = $qb->getQuery()->getSingleScalarResult();

        return $count === 0;
    }

    /**
     * Obtiene todas las reservas activas para una habitación en un rango de fechas
     * 
     * @param int $roomId ID de la habitación
     * @param DateTime $checkIn Fecha de entrada
     * @param DateTime $checkOut Fecha de salida
     * @return array
     */
    public function getActiveReservationsForRoom(int $roomId, DateTime $checkIn, DateTime $checkOut): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.room = :roomId')
            ->andWhere('
                (r.checkIn <= :checkIn AND r.checkOut > :checkIn) OR
                (r.checkIn < :checkOut AND r.checkOut >= :checkOut) OR
                (r.checkIn >= :checkIn AND r.checkOut <= :checkOut)
            ')
            ->setParameter('roomId', $roomId)
            ->setParameter('checkIn', $checkIn)
            ->setParameter('checkOut', $checkOut)
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene todas las reservas activas para un usuario
     * 
     * @param int $userId ID del usuario
     * @return array
     */
    public function getActiveReservationsForUser(int $userId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->andWhere('r.checkOut >= :today')
            ->setParameter('userId', $userId)
            ->setParameter('today', new DateTime())
            ->orderBy('r.checkIn', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
