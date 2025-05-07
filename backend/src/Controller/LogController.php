<?php

namespace App\Controller;

use App\Entity\Log;
use App\Repository\LogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use DateTime;

#[Route('/api/logs')]
#[IsGranted('ROLE_ADMIN')]
class LogController extends AbstractController
{
    #[Route('', name: 'get_logs', methods: ['GET'])]
    public function getLogs(
        Request $request,
        LogRepository $logRepository
    ): JsonResponse {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $userId = $request->query->get('userId');
        $action = $request->query->get('action');
        $entityType = $request->query->get('entityType');
        $entityId = $request->query->get('entityId');
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $qb = $logRepository->createQueryBuilder('l')
            ->orderBy('l.createdAt', 'DESC');

        if ($userId) {
            $qb->andWhere('l.user = :userId')
                ->setParameter('userId', $userId);
        }

        if ($action) {
            $qb->andWhere('l.action = :action')
                ->setParameter('action', $action);
        }

        if ($entityType) {
            $qb->andWhere('l.entityType = :entityType')
                ->setParameter('entityType', $entityType);
        }

        if ($entityId) {
            $qb->andWhere('l.entityId = :entityId')
                ->setParameter('entityId', $entityId);
        }

        if ($startDate) {
            $qb->andWhere('l.createdAt >= :startDate')
                ->setParameter('startDate', new DateTime($startDate));
        }

        if ($endDate) {
            $qb->andWhere('l.createdAt <= :endDate')
                ->setParameter('endDate', new DateTime($endDate));
        }

        $total = count($qb->getQuery()->getResult());
        $logs = $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->json([
            'logs' => $logs,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]);
    }
} 