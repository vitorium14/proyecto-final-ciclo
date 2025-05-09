<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class UserController extends AbstractController
{
    // GET ALL USERS
    #[Route('/users', name: 'get_users', methods: ['GET'])]
    public function getUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        $users = $entityManager->getRepository(User::class)->findAll();
        return $this->json($users, Response::HTTP_OK, [], ['groups' => ['user']]);
    }

    // GET USER BY ID
    #[Route('/users/{id}', name: 'get_user_by_id', methods: ['GET'])]
    public function getUserById(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user']]);
    }

    // CREATE USER
    #[Route('/users', name: 'create_user', methods: ['POST'])]
    public function createUser(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = new User();

        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        $user->setEmail($data['email']);
        $user->setPassword($data['password']);

        // ROLE MUST BE (ADMIN,EMPLOYEE,CLIENT)
        if (!in_array($data['role'], ['ADMIN', 'EMPLOYEE', 'CLIENT'])) {
            return $this->json(['error' => 'Invalid role. Must be ADMIN, EMPLOYEE or CLIENT.'], Response::HTTP_BAD_REQUEST);
        }
        $user->setRole($data['role']);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user']]);
    }

    // UPDATE USER
    #[Route('/users/{id}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $entityManager->getRepository(User::class)->find($id);

        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        $user->setEmail($data['email']);
        $user->setPassword($data['password']);
        
        // ROLE MUST BE (ADMIN,EMPLOYEE,CLIENT)
        if (!in_array($data['role'], ['ADMIN', 'EMPLOYEE', 'CLIENT'])) {
            return $this->json(['error' => 'Invalid role. Must be ADMIN, EMPLOYEE or CLIENT.'], Response::HTTP_BAD_REQUEST);
        }
        $user->setRole($data['role']);

        $entityManager->flush();

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user']]);  
    }

    // DELETE USER
    #[Route('/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

}
