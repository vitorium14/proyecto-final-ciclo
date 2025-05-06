<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $checkIn = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $checkOut = null;

    #[ORM\Column(length: 20)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, ReservationService>
     */
    #[ORM\OneToMany(targetEntity: ReservationService::class, mappedBy: 'reservation')]
    private Collection $reservationServices;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Room $room = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $checkedInAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $checkedOutAt = null;

    public function __construct()
    {
        $this->reservationServices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCheckIn(): ?\DateTime
    {
        return $this->checkIn;
    }

    public function setCheckIn(?\DateTime $checkIn): static
    {
        $this->checkIn = $checkIn;

        return $this;
    }

    public function getCheckOut(): ?\DateTime
    {
        return $this->checkOut;
    }

    public function setCheckOut(?\DateTime $checkOut): static
    {
        $this->checkOut = $checkOut;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * @return Collection<int, ReservationService>
     */
    public function getReservationServices(): Collection
    {
        return $this->reservationServices;
    }

    public function addReservationService(ReservationService $reservationService): static
    {
        if (!$this->reservationServices->contains($reservationService)) {
            $this->reservationServices->add($reservationService);
            $reservationService->setReservation($this);
        }

        return $this;
    }

    public function removeReservationService(ReservationService $reservationService): static
    {
        if ($this->reservationServices->removeElement($reservationService)) {
            // set the owning side to null (unless already changed)
            if ($reservationService->getReservation() === $this) {
                $reservationService->setReservation(null);
            }
        }

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCheckedInAt(): ?\DateTimeImmutable
    {
        return $this->checkedInAt;
    }

    public function setCheckedInAt(?\DateTimeImmutable $checkedInAt): static
    {
        $this->checkedInAt = $checkedInAt;

        return $this;
    }

    public function getCheckedOutAt(): ?\DateTimeImmutable
    {
        return $this->checkedOutAt;
    }

    public function setCheckedOutAt(?\DateTimeImmutable $checkedOutAt): static
    {
        $this->checkedOutAt = $checkedOutAt;

        return $this;
    }

    public function getRoom(): ?Room
    {
        return $this->room;
    }

    public function setRoom(?Room $room): static
    {
        $this->room = $room;

        return $this;
    }
}
