<?php

namespace App\Service;

use App\Entity\User;
use Firebase\JWT\JWT;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\Key;

/**
 * Service for creating and managing JSON Web Tokens (JWT).
 */
class JwtService
{
    private string $secretKey;
    private string $algorithm = 'HS256';
    private int $tokenLifetime = 86400; // Token valid for 1 day (86400 seconds)

    public function __construct()
    {
        $this->secretKey = $_ENV['API_KEY'];
    }

    /**
     * Creates a new JWT for a given user.
     *
     * @param User $user The user entity for whom the token is generated.
     * @return string The generated JWT string.
     */
    public function createToken(User $user): string
    {
        $issuedAt = new DateTimeImmutable();
        $expire = $issuedAt->modify('+' . $this->tokenLifetime . ' seconds')->getTimestamp();

        $payload = [
            'iat' => $issuedAt->getTimestamp(),    // Issued at: time when the token was generated
            'nbf' => $issuedAt->getTimestamp(),    // Not before: time before which the token is not valid
            'exp' => $expire,                      // Expire: time when the token will expire
            'email' => $user->getEmail(),          // User-specific claim
            'userId' => $user->getId(),
            'role' => $user->getRole()
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function getUserFromToken(string $token, EntityManagerInterface $entityManager): User
    {
        // Remove Bearer from token
        $token = str_replace('Bearer ', '', $token);
        $payload = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
        $user = $entityManager->getRepository(User::class)->find($payload->userId);
        return $user;
    }

    public function checkAdmin(string $token, EntityManagerInterface $entityManager): bool
    {
        $user = $this->getUserFromToken($token, $entityManager);
        return $user->getRole() == 'ADMIN';
    }

    public function checkEmployee(string $token, EntityManagerInterface $entityManager): bool
    {
        $user = $this->getUserFromToken($token, $entityManager);
        return $user->getRole() == 'EMPLOYEE' || $user->getRole() == 'ADMIN';
    }

    public function getUserId(string $token, EntityManagerInterface $entityManager): int
    {
        $payload = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
        return $payload->userId;
    }
}
