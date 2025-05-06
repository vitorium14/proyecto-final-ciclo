<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/users')]
class UserController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
    }

    #[Route('/client', name: 'api_user_create_client', methods: ['POST'])]
    public function createClientUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password']) || empty($data['name']) || empty($data['surnames'])) {
            return new JsonResponse(['error' => 'Missing required fields: email, password, name, surnames'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Check if email already exists
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already exists'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        $user->setEmail($data['email']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setRole('ROLE_USER'); // Default role for clients

        // Basic validation using Symfony Validator (optional, but good practice)
        // You'd need to add Assert annotations to your User entity for this to work fully
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Client user created successfully', 'userId' => $user->getId()], JsonResponse::HTTP_CREATED);
    }

    #[Route('/privileged', name: 'api_user_create_privileged', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createAdminOrEmployeeUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password']) || empty($data['name']) || empty($data['surnames']) || empty($data['role'])) {
            return new JsonResponse(['error' => 'Missing required fields: email, password, name, surnames, role'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $allowedRoles = ['ROLE_ADMIN', 'ROLE_EMPLOYEE'];
        if (!in_array($data['role'], $allowedRoles)) {
            return new JsonResponse(['error' => 'Invalid role specified. Must be ROLE_ADMIN or ROLE_EMPLOYEE.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Check if email already exists
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already exists'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        $user->setEmail($data['email']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setRole($data['role']);

        // Basic validation
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['message' => $data['role'] . ' user created successfully', 'userId' => $user->getId()], JsonResponse::HTTP_CREATED);
    }
} 