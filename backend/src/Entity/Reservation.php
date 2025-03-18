<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Client $client = null;

    /**
     * @var Collection<int, Room>
     */
    #[ORM\ManyToMany(targetEntity: Room::class)]
    private Collection $room;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $start_date = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $final_date = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column]
    private ?float $total_price = null;

    /**
     * @var Collection<int, CheckInOut>
     */
    #[ORM\OneToMany(targetEntity: CheckInOut::class, mappedBy: 'reservation', orphanRemoval: true)]
    private Collection $checkInOuts;

    public function __construct()
    {
        $this->room = new ArrayCollection();
        $this->checkInOuts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Collection<int, Room>
     */
    public function getRoom(): Collection
    {
        return $this->room;
    }

    public function addRoom(Room $room): static
    {
        if (!$this->room->contains($room)) {
            $this->room->add($room);
        }

        return $this;
    }

    public function removeRoom(Room $room): static
    {
        $this->room->removeElement($room);

        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->start_date;
    }

    public function setStartDate(\DateTimeInterface $start_date): static
    {
        $this->start_date = $start_date;

        return $this;
    }

    public function getFinalDate(): ?\DateTimeInterface
    {
        return $this->final_date;
    }

    public function setFinalDate(\DateTimeInterface $final_date): static
    {
        $this->final_date = $final_date;

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

    public function getTotalPrice(): ?float
    {
        return $this->total_price;
    }

    public function setTotalPrice(float $total_price): static
    {
        $this->total_price = $total_price;

        return $this;
    }

    /**
     * @return Collection<int, CheckInOut>
     */
    public function getCheckInOuts(): Collection
    {
        return $this->checkInOuts;
    }

    public function addCheckInOut(CheckInOut $checkInOut): static
    {
        if (!$this->checkInOuts->contains($checkInOut)) {
            $this->checkInOuts->add($checkInOut);
            $checkInOut->setReservation($this);
        }

        return $this;
    }

    public function removeCheckInOut(CheckInOut $checkInOut): static
    {
        if ($this->checkInOuts->removeElement($checkInOut)) {
            // set the owning side to null (unless already changed)
            if ($checkInOut->getReservation() === $this) {
                $checkInOut->setReservation(null);
            }
        }

        return $this;
    }
}
