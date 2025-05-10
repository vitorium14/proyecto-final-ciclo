<?php

namespace App\Entity;

use App\Repository\RoomTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: RoomTypeRepository::class)]
class RoomType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['room_type', 'room'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['room_type', 'room'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['room_type', 'room'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['room_type', 'room'])]
    private ?string $price = null;

    #[ORM\Column]
    #[Groups(['room_type', 'room'])]
    private ?int $capacity = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['room_type', 'room'])]
    private ?string $amenities = null;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\ManyToMany(targetEntity: Image::class, cascade: ['persist'])]
    #[Groups(['room_type', 'room'])]
    private Collection $images;

    /**
     * @var Collection<int, Room>
     */
    #[ORM\OneToMany(targetEntity: Room::class, mappedBy: 'type')]
    #[Groups(['room_type'])]
    private Collection $rooms;

    public function __construct()
    {
        $this->images = new ArrayCollection();
        $this->rooms = new ArrayCollection();
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

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getCapacity(): ?int
    {
        return $this->capacity;
    }

    public function setCapacity(int $capacity): static
    {
        $this->capacity = $capacity;

        return $this;
    }

    /**
     * @return string[]
     */
    public function getAmenities(): array
    {
        if (empty($this->amenities)) {
            return [];
        }
        // Split by comma, trim whitespace from each item, and filter out empty strings if any result from multiple commas
        return array_filter(array_map('trim', explode(',', $this->amenities)), function ($value) {
            return $value !== '';
        });
    }

    /**
     * @param string[]|null $amenities
     */
    public function setAmenities(?array $amenities): static
    {
        if (empty($amenities)) {
            $this->amenities = null;
        } else {
            // Join by comma and a space for readability in the DB, ensure no empty strings are joined if array was filtered
            $this->amenities = implode(', ', array_filter($amenities, function ($value) {
                return !empty(trim($value));
            }));
            if (empty($this->amenities)) { // If implode results in an empty string (e.g. array of empty strings)
                $this->amenities = null;
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
        }

        return $this;
    }

    public function removeImage(Image $image): static
    {
        $this->images->removeElement($image);

        return $this;
    }

    /**
     * @return Collection<int, Room>
     */
    public function getRooms(): Collection
    {
        return $this->rooms;
    }

    public function addRoom(Room $room): static
    {
        if (!$this->rooms->contains($room)) {
            $this->rooms->add($room);
            $room->setType($this);
        }

        return $this;
    }

    public function removeRoom(Room $room): static
    {
        if ($this->rooms->removeElement($room)) {
            // set the owning side to null (unless already changed)
            if ($room->getType() === $this) {
                $room->setType(null);
            }
        }

        return $this;
    }
}
