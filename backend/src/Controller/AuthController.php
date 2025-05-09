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

final class AuthController extends AbstractController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    // LOGIN
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'];
        $password = $data['password'];

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !password_verify($password, $user->getPassword())) {
            return $this->json(['message' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        // CHECK IF TOKEN EXISTS
        $token = $entityManager->getRepository(Token::class)->findOneBy(['user' => $user]);
        if ($token) {
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

    // LOGOUT
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

    // REGISTER
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // NEW USER
        $data = json_decode($request->getContent(), true);

        // GET AUTH HEADER
        $authHeader = $request->headers->get('Authorization');

        // CHECK IF USER EXISTS
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
            $isAdmin = $this->jwtService->checkAdmin($authHeader, $entityManager);
            if (!$isAdmin) {
                return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
            }
        }

        // SAVE USER
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user']]);
    }
}
