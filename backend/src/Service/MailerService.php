<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use App\Entity\User;
use App\Entity\Booking;
use App\Entity\RoomType;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;

class MailerService
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
    }

    public function registrationEmail(User $user): void
    {
        $email = (new TemplatedEmail())
            ->from('contacto@victorgimenez.com')
            ->to($user->getEmail())
            ->subject('Gracias por registrarte en Hotel Paraiso')
            ->htmlTemplate('emails/registration.html.twig')
            ->context([
                'user' => $user,
                'loginURL' => 'https://hotel.victorgimenez.com/login'
            ]);

        $this->mailer->send($email);
    }

    public function bookingConfirmationEmail(User $user, Booking $booking, RoomType $roomType): void
    {
        $email = (new TemplatedEmail())
            ->from('contacto@victorgimenez.com')
            ->to($user->getEmail())
            ->subject('Confirmación de reserva')
            ->htmlTemplate('emails/booking_confirmation.html.twig')
            ->context([
                'booking' => $booking,
                'roomType' => $roomType,
                'bookingDetailsURL' => 'https://hotel.victorgimenez.com/booking/' . $booking->getId()
            ]);

        $this->mailer->send($email);
    }

    public function bookingCancellationEmail(User $user, Booking $booking): void
    {
        $email = (new TemplatedEmail())
            ->from('contacto@victorgimenez.com')
            ->to($user->getEmail())
            ->subject('Cancelación de reserva')
            ->htmlTemplate('emails/booking_cancellation.html.twig')
            ->context([
                'booking' => $booking,
                'roomType' => $booking->getRoom()->getType(),
            ]);

        $this->mailer->send($email);
    }
}
