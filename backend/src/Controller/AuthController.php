<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController extends AbstractController
{

    #[Route('/login', name: 'app_login', methods: ['POST'])]
    public function postLogin(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $requestContent = json_decode($request->getContent(), true);

        $email = $requestContent['email'];
        $password = $requestContent['password'];

        $password = md5($password);

        $user = $entityManager->getRepository(User::class)->findOneBy(array('email' => $email, 'password' => $password));

        if ($user) {
            return $this->json(['Status' => '200', 'Message' => 'Login Succesful'], Response::HTTP_OK);
        }

        return $this->json(['Status' => '401', 'Message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
    }
}
