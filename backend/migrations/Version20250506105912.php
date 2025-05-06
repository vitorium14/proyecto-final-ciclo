<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250506105912 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE image (id INT AUTO_INCREMENT NOT NULL, room_type_id INT DEFAULT NULL, service_id INT DEFAULT NULL, image LONGTEXT NOT NULL, main TINYINT(1) NOT NULL, INDEX IDX_C53D045F296E3073 (room_type_id), INDEX IDX_C53D045FED5CA9E6 (service_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE log (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, INDEX IDX_8F3F68C5A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reservation (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, check_in DATETIME NOT NULL, check_out DATETIME NOT NULL, total_price NUMERIC(10, 2) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', observations LONGTEXT DEFAULT NULL, INDEX IDX_42C84955A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reservation_service (reservation_id INT NOT NULL, service_id INT NOT NULL, INDEX IDX_86082157B83297E7 (reservation_id), INDEX IDX_86082157ED5CA9E6 (service_id), PRIMARY KEY(reservation_id, service_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE room (id INT AUTO_INCREMENT NOT NULL, room_type_id INT NOT NULL, number VARCHAR(50) NOT NULL, INDEX IDX_729F519B296E3073 (room_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE room_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, price NUMERIC(10, 2) NOT NULL, amenities LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE service (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, duration VARCHAR(100) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, surnames VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE image ADD CONSTRAINT FK_C53D045F296E3073 FOREIGN KEY (room_type_id) REFERENCES room_type (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE image ADD CONSTRAINT FK_C53D045FED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE log ADD CONSTRAINT FK_8F3F68C5A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation ADD CONSTRAINT FK_42C84955A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service ADD CONSTRAINT FK_86082157B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service ADD CONSTRAINT FK_86082157ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room ADD CONSTRAINT FK_729F519B296E3073 FOREIGN KEY (room_type_id) REFERENCES room_type (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE image DROP FOREIGN KEY FK_C53D045F296E3073
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE image DROP FOREIGN KEY FK_C53D045FED5CA9E6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE log DROP FOREIGN KEY FK_8F3F68C5A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service DROP FOREIGN KEY FK_86082157B83297E7
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service DROP FOREIGN KEY FK_86082157ED5CA9E6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE room DROP FOREIGN KEY FK_729F519B296E3073
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE image
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE log
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reservation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reservation_service
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE room
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE room_type
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE service
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user
        SQL);
    }
}
