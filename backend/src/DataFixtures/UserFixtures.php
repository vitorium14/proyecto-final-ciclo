<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Crear usuario administrador
        $adminUser = new User();
        $adminUser->setName('Admin');
        $adminUser->setSurnames('System');
        $adminUser->setEmail('admin@hostalmanager.com');
        
        // Hash de la contraseña con el hasher integrado de Symfony
        $hashedPassword = $this->passwordHasher->hashPassword(
            $adminUser,
            'Admin123!'  // Contraseña en texto plano
        );
        $adminUser->setPassword($hashedPassword);
        
        // Establecer el rol como administrador
        $adminUser->setRole('ROLE_ADMIN');
        
        $manager->persist($adminUser);
        
        // Si deseas crear otros usuarios de prueba, puedes hacerlo aquí
        
        $manager->flush();
    }
} 