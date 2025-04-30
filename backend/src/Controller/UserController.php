<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
#[Route('/api/users')]
final class UserController extends AbstractController
{
    // List all users
    #[Route('', name: 'user_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $entityManager): Response
    {
        if (
            !$this->isGranted('ROLE_EMPLOYEE') &&
            !$this->isGranted('ROLE_ADMIN')
        ) {
            throw $this->createAccessDeniedException('No tienes permiso para crear reservas.');
        }
        
        $users = $entityManager->getRepository(User::class)->findAll();
        return $this->json($users);
    }

    // Get a single user by ID
    #[Route('/{id}', name: 'user_show', methods: ['GET'])]
    public function show(int $id, EntityManagerInterface $entityManager): Response
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        return $this->json($user);
    }

}
