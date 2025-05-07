<?php

namespace App\Service;

use App\Entity\Log;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class LogService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function createLog(
        ?User $user,
        string $action,
        string $entityType,
        int $entityId,
        string $details
    ): void {
        $log = new Log();
        $log->setUser($user);
        $log->setAction($action);
        $log->setEntityType($entityType);
        $log->setEntityId($entityId);
        $log->setDetails($details);
        $log->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($log);
        $this->entityManager->flush();
    }
} 