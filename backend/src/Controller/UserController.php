<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser; // Added use statement
#[Route('/api/users')]
final class UserController extends AbstractController
{
    // List all users
    #[Route('', name: 'user_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $entityManager): Response
    {
        // Only Admins can list all users
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException('No tienes permiso para listar usuarios.'); // Corrected message
        }
        
        $users = $entityManager->getRepository(User::class)->findAll();
        return $this->json($users);
    }

    // Get a single user by ID
    #[Route('/{id}', name: 'user_show', methods: ['GET'])]
    // Inject CurrentUser attribute
    public function show(int $id, EntityManagerInterface $entityManager, #[CurrentUser] ?User $currentUser): Response
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if the current user is the requested user or an admin
        if ($currentUser !== $user && !$this->isGranted('ROLE_ADMIN')) {
             throw $this->createAccessDeniedException('No tienes permiso para ver este usuario.');
        }

        return $this->json($user);
    }

// Added method to update a user (e.g., roles, email) - Admin only
    #[Route('/{id}', name: 'user_update', methods: ['PATCH'])]
    public function update(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
             throw $this->createAccessDeniedException('No tienes permiso para modificar usuarios.');
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Example: Update roles
        if (isset($data['roles']) && is_array($data['roles'])) {
            // Add validation for allowed roles if needed
            $user->setRoles($data['roles']);
        }

        // Example: Update email (consider validation)
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        // Add other updatable fields as necessary (fullname, phone, dni?)

        $entityManager->flush();

        return $this->json(['message' => 'User updated']);
    }

    // Added method to delete a user - Admin only
    #[Route('/{id}', name: 'user_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $entityManager): Response
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
             throw $this->createAccessDeniedException('No tienes permiso para eliminar usuarios.');
        }

        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Add safety checks? Prevent deleting own account? Prevent deleting last admin?

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'User deleted'], Response::HTTP_NO_CONTENT);
    }
}
