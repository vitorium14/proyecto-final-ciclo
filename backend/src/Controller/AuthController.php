<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;

final class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_CLIENT']);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Usuario registrado']);
    }
}
