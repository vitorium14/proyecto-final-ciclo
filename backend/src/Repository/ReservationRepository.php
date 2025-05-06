<?php

namespace App\Repository;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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
     * @return Reservation[] Returns an array of Reservation objects
     */
    public function findByYearAndMonth(int $year, int $month): array
    {
        $startDate = new \DateTimeImmutable("$year-$month-01");
        $endDate = $startDate->modify('last day of this month')->setTime(23, 59, 59);

        return $this->createQueryBuilder('r')
            ->andWhere('r.checkIn <= :endDate')      // Changed from r.startDate
            ->andWhere('r.checkOut >= :startDate')   // Changed from r.endDate
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('r.checkIn', 'ASC')           // Changed from r.startDate
            ->getQuery()
            ->getResult();
    }
}
