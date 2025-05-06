<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class AuthenticationSuccessListener
{
    /**
     * Add user data to the authentication success response
     */
    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData();
        $user = $event->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Add user data to the response
        $data['user'] = [
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'firstName' => $user->getName(), // Adjust these property names to match your User entity
            'lastName' => $user->getSurnames(),
            'roles' => $user->getRoles(),
        ];

        $event->setData($data);
    }
} 