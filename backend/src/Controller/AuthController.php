<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Token;

/**
 * Controller for handling user authentication: login, logout, and registration.
 */
#[Route('/api')]
final class AuthController extends AbstractController
{
    private JwtService $jwtService;

    /**
     * AuthController constructor.
     * @param JwtService $jwtService Service for JWT operations.
     */
    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    #[Route('/', name: 'ping', methods: ['GET'])]
    public function ping(): JsonResponse
    {
        return $this->json(['message' => 'Ping successful']);
    }

    /**
     * Handles user login.
     * Expects 'email' and 'password' in JSON request body.
     *
     * @param Request $request The HTTP request.
     * @param EntityManagerInterface $entityManager Doctrine entity manager.
     * @return JsonResponse Contains JWT token on success or error message.
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return $this->json(['message' => 'Invalid JSON payload. Email and password are required.'], Response::HTTP_BAD_REQUEST);
        }
        $email = $data['email'];
        $password = $data['password'];

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !password_verify($password, $user->getPassword())) {
            return $this->json(['message' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        // REVOKE ALL TOKENS FOR THE USER
        $tokens = $entityManager->getRepository(Token::class)->findBy(['user' => $user, 'revoked' => false]);
        foreach ($tokens as $token) {
            $token->setRevoked(true);
            $token->setRevokedAt(new \DateTimeImmutable());
            $entityManager->flush();
        }

        $token = new Token();
        $token->setToken($this->jwtService->createToken($user));
        $token->setCreatedAt(new \DateTimeImmutable());
        $token->setRevokedAt(null);
        $token->setRevoked(false);
        $token->setUser($user);
        $entityManager->persist($token);
        $entityManager->flush();

        return $this->json(['token' => $token->getToken(), 'user' => $user]);
    }

    /**
     * Handles user logout by revoking the provided JWT.
     * Expects JWT in 'Authorization: Bearer <token>' header.
     *
     * @param Request $request The HTTP request.
     * @param EntityManagerInterface $entityManager Doctrine entity manager.
     * @return JsonResponse Confirmation message or error.
     */
    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'];

        $token = $entityManager->getRepository(Token::class)->findOneBy(['token' => $token]);
        $token->setRevokedAt(new \DateTimeImmutable());
        $token->setRevoked(true);
        $entityManager->flush();

        return $this->json(['message' => 'Logged out successfully']);
    }


    /**
     * Handles new user registration.
     * Expects 'email', 'password', 'name', 'surnames', 'role' in JSON request body.
     * Passwords are hashed before storing.
     * TODO: Add robust input validation (e.g., email format, password strength).
     *
     * @param Request $request The HTTP request.
     * @param EntityManagerInterface $entityManager Doctrine entity manager.
     * @return JsonResponse Confirmation message or error (e.g., user already exists).
     */
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        // Basic validation for required fields
        $requiredFields = ['email', 'password', 'name', 'surnames', 'role'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['message' => "Missing or empty field: {$field}"], Response::HTTP_BAD_REQUEST);
            }
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($user) {
            return $this->json(['message' => 'User already exists'], Response::HTTP_BAD_REQUEST);
        }

        // CREATE USER
        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        $user->setName($data['name']);
        $user->setSurnames($data['surnames']);
        // ROLE MUST BE ADMIN, EMPLOYEE OR CLIENT
        if (!in_array($data['role'], ['ADMIN', 'EMPLOYEE', 'CLIENT'])) {
            return $this->json(['message' => 'Invalid role'], Response::HTTP_BAD_REQUEST);
        }

        if ($data['role'] != 'CLIENT') {
            // CHECK IF USER IS ADMIN OR EMPLOYEE
            $isAdmin = $this->jwtService->checkAdmin($request->headers->get('Authorization'), $entityManager);
            if (!$isAdmin) {
                return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
            }
        }

        $user->setRole($data['role']);

        // SAVE USER
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user']]);
    }
}
