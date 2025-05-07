<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\LogService;
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
    private LogService $logService;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        LogService $logService
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->logService = $logService;
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

        // Crear log de la acción
        $details = sprintf(
            'Usuario creado. Email: %s, Nombre: %s, Roles: %s',
            $user->getEmail(),
            $user->getName(),
            implode(', ', $user->getRoles())
        );
        $this->logService->createLog(
            $this->getUser(),
            'create',
            'user',
            $user->getId(),
            $details
        );

        return new JsonResponse(['message' => 'Client user created successfully', 'userId' => $user->getId()], JsonResponse::HTTP_CREATED);
    }

    #[Route('/privileged', name: 'api_user_create_privileged', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createAdminOrEmployeeUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password']) || empty($data['name']) || empty($data['surnames']) || empty($data['roles'])) {
            return new JsonResponse(['error' => 'Missing required fields: email, password, name, surnames, role'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $allowedRoles = ['ROLE_ADMIN', 'ROLE_EMPLOYEE'];
        if (!in_array($data['roles'], $allowedRoles)) {
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
        $user->setRole($data['roles']);

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

        // Crear log de la acción
        $details = sprintf(
            'Usuario creado. Email: %s, Nombre: %s, Roles: %s',
            $user->getEmail(),
            $user->getName(),
            implode(', ', $user->getRoles())
        );
        $this->logService->createLog(
            $this->getUser(),
            'create',
            'user',
            $user->getId(),
            $details
        );

        return new JsonResponse(['message' => $data['roles'] . ' user created successfully', 'userId' => $user->getId()], JsonResponse::HTTP_CREATED);
    }

    #[Route('', name: 'api_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, min(50, (int)$request->query->get('limit', 10)));
        $search = $request->query->get('search');
        $role = $request->query->get('role');
        
        $queryBuilder = $this->entityManager->getRepository(User::class)->createQueryBuilder('u');
        
        if ($search) {
            $queryBuilder->andWhere('u.name LIKE :search OR u.surnames LIKE :search OR u.email LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }
        
        if ($role) {
            $queryBuilder->andWhere('u.role = :role')
                ->setParameter('role', $role);
        }
        
        $totalUsers = count($queryBuilder->getQuery()->getResult());
        
        $users = $queryBuilder
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        
        return $this->json([
            'users' => $users,
            'total' => $totalUsers,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($totalUsers / $limit)
        ], JsonResponse::HTTP_OK, [], ['groups' => ['user:list']]);
    }

    #[Route('/{id}', name: 'api_user_get', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function get_User(int $id): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find($id);
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        return $this->json($user, JsonResponse::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'api_user_update', methods: ['PUT'])]
    public function updateUser(int $id, Request $request): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find($id);
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Verificar si el usuario actual es admin o el propio usuario
        $currentUser = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $currentUser->getId() !== $id) {
            return new JsonResponse(['error' => 'Access denied'], JsonResponse::HTTP_FORBIDDEN);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $user->setName($data['name']);
        }
        
        if (isset($data['surnames'])) {
            $user->setSurnames($data['surnames']);
        }
        
        if (isset($data['email'])) {
            // Validar formato de email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return new JsonResponse(['error' => 'Formato de email inválido'], JsonResponse::HTTP_BAD_REQUEST);
            }

            // Verificar si el nuevo email ya está en uso
            $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser && $existingUser->getId() !== $id) {
                return new JsonResponse(['error' => 'El email ya está en uso'], JsonResponse::HTTP_CONFLICT);
            }
            $oldEmail = $user->getEmail();
            $user->setEmail($data['email']);
        }
        
        if (isset($data['password'])) {
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        }

        // Solo los administradores pueden modificar el rol
        if (isset($data['role']) && $this->isGranted('ROLE_ADMIN')) {
            $allowedRoles = ['ROLE_USER', 'ROLE_EMPLOYEE', 'ROLE_ADMIN'];
            if (!in_array($data['role'], $allowedRoles)) {
                return new JsonResponse(['error' => 'Invalid role specified'], JsonResponse::HTTP_BAD_REQUEST);
            }
            $user->setRole($data['role']);
        }
        
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->flush();
        
        // Crear log de la acción
        $details = sprintf(
            'Usuario %d actualizado. Cambios: %s',
            $user->getId(),
            implode(', ', array_filter([
                isset($data['name']) ? "Nombre: {$user->getName()} -> {$data['name']}" : null,
                isset($data['surnames']) ? "Apellidos: {$user->getSurnames()} -> {$data['surnames']}" : null,
                isset($data['email']) ? "Email: {$oldEmail} -> {$data['email']}" : null,
                isset($data['password']) ? "Contraseña actualizada" : null,
                isset($data['role']) ? "Rol: {$user->getRole()} -> {$data['role']}" : null
            ]))
        );
        $this->logService->createLog(
            $this->getUser(),
            'update',
            'user',
            $user->getId(),
            $details
        );
        
        return new JsonResponse($user, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_user_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find($id);
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        // Prevent deleting the last admin
        if ($user->getRole() === 'ROLE_ADMIN') {
            $adminCount = $this->entityManager->getRepository(User::class)->count(['role' => 'ROLE_ADMIN']);
            if ($adminCount <= 1) {
                return new JsonResponse(['error' => 'Cannot delete the last admin user'], JsonResponse::HTTP_CONFLICT);
            }
        }
        
        $this->entityManager->remove($user);
        $this->entityManager->flush();
        
        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/role', name: 'api_user_update_role', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUserRole(int $id, Request $request): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find($id);
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['role'])) {
            return new JsonResponse(['error' => 'Role is required'], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        $allowedRoles = ['ROLE_USER', 'ROLE_EMPLOYEE', 'ROLE_ADMIN'];
        if (!in_array($data['role'], $allowedRoles)) {
            return new JsonResponse(['error' => 'Invalid role specified'], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        // Prevent changing the role of the last admin
        if ($user->getRole() === 'ROLE_ADMIN' && $data['role'] !== 'ROLE_ADMIN') {
            $adminCount = $this->entityManager->getRepository(User::class)->count(['role' => 'ROLE_ADMIN']);
            if ($adminCount <= 1) {
                return new JsonResponse(['error' => 'Cannot change the role of the last admin user'], JsonResponse::HTTP_CONFLICT);
            }
        }
        
        $user->setRole($data['role']);
        $this->entityManager->flush();
        
        return new JsonResponse($user, JsonResponse::HTTP_OK);
    }
} 