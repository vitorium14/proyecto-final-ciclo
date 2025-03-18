<?php

namespace App\Controller;

use App\Entity\Role;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

final class UserController extends AbstractController
{
    #[Route('/user', name: 'app_user_create', methods: ['POST'])]
    public function postUser(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $requestContent = json_decode($request->getContent(), true);

        $name = $requestContent['name'];
        $email = $requestContent['email'];
        $password = $requestContent['password'];
        $role = $requestContent['role'];

        $password = md5($password);

        $user = new User();

        $user->setName($name);
        $user->setEmail($email);
        $user->setPassword($password);
        $user->setRole(Role::from($role));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['Status' => '200', 'Message' => 'User created'], Response::HTTP_OK);
    }
}
