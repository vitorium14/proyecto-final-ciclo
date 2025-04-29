<?php

namespace App\Controller;

use Monolog\Logger;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class MailerController extends AbstractController
{

    #[Route('/email')]
    public function sendEmail(MailerInterface $mailer): Response
    {
        try {
            $email = (new Email())
                ->from('t76621781@gmail.com')
                ->to('vitorium14@gmail.com')
                //->cc('cc@example.com')
                //->bcc('bcc@example.com')
                //->replyTo('fabien@example.com')
                //->priority(Email::PRIORITY_HIGH)
                ->subject('Time for Symfony Mailer!')
                ->text('Sending emails is fun again!')
                ->html('<p>See Twig integration for better HTML integration!</p>');

            $mailer->send($email);
            return new Response('Email sent successfully!');
        } catch (TransportExceptionInterface $e) {
            // Log the error or return a meaningful response
            return new Response('Failed to send email: ' . $e->getMessage(), 500);
        }
    }
}
