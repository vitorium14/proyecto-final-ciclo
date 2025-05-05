<?php

namespace App\Entity;

use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])] // Add duration (in minutes, default 0)
    private ?int $duration = 0;

    #[ORM\Column(length: 50, nullable: true)] // Add category (nullable for now)
    private ?string $category = null;

    #[ORM\Column(length: 255, nullable: true)] // Add image (nullable)
    private ?string $image = null;

    /**
     * @var Collection<int, ReservationService>
     */
    #[ORM\OneToMany(targetEntity: ReservationService::class, mappedBy: 'service')]
    private Collection $reservationServices;

    public function __construct()
    {
        $this->reservationServices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

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
            $reservationService->setService($this);
        }

        return $this;
    }

    public function removeReservationService(ReservationService $reservationService): static
    {
        if ($this->reservationServices->removeElement($reservationService)) {
            // set the owning side to null (unless already changed)
            if ($reservationService->getService() === $this) {
                $reservationService->setService(null);
            }
        }

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;

        return $this;
    }
}
