<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\JwtService;

#[Route('/api')]
final class UserController extends AbstractController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }
    // GET ALL USERS
    #[Route('/users', name: 'get_users', methods: ['GET'])]
    public function getUsers(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // CHECK IF USER IS ADMIN
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $users = $entityManager->getRepository(User::class)->findAll();
        return $this->json($users, Response::HTTP_OK, [], ['groups' => ['user']]);
    }

    // GET USER BY ID
    #[Route('/users/{id}', name: 'get_user_by_id', methods: ['GET'])]
    public function getUserById(Request $request, EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        // CHECK IF USER IS ADMIN OR USER
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin && $user->getId() !== $this->jwtService->getUserId($request->headers->get('Authorization'), $entityManager)) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user']]);
    }

    // UPDATE USER
    #[Route('/users/{id}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $entityManager->getRepository(User::class)->find($id);

        // CHECK IF USER IS ADMIN OR USER
        $isAdmin = $this->jwtService->checkAdmin($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin && $user->getId() !== $this->jwtService->getUserId($request->headers->get('Authorization'), $entityManager)) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        $user->setEmail($data['email']);
        //$user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        
        // CHECK IF THERE IS A PASSWORD IN THE REQUEST IF NOT KEEP THE SAME
        if (isset($data['password'])) {
            $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        }else{
            $user->setPassword($user->getPassword());
        }

        // CHECK IF THERE IS A ROLE IN THE REQUEST IF NOT KEEP THE SAME
        if (isset($data['role'])) {
            // ROLE MUST BE (ADMIN,EMPLOYEE,CLIENT)
            if (!in_array($data['role'], ['ADMIN', 'EMPLOYEE', 'CLIENT'])) {
                return $this->json(['error' => 'Invalid role. Must be ADMIN, EMPLOYEE or CLIENT.'], Response::HTTP_BAD_REQUEST);
            }

            if ($data['role'] != 'CLIENT' && !$isAdmin) {
                return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
            }
            
            $user->setRole($data['role']);
        }else{
            $user->setRole($user->getRole());
        }

        $entityManager->flush();

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user']]);  
    }

    // DELETE USER
    #[Route('/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(Request $request, EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        // CHECK IF USER IS ADMIN
        $isAdmin = $this->jwtService->checkEmployee($request->headers->get('Authorization'), $entityManager);
        if (!$isAdmin) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

}
