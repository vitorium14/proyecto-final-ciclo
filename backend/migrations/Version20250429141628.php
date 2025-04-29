<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250429141628 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE reservation (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, room_id INT NOT NULL, check_in DATETIME DEFAULT NULL, check_out DATETIME DEFAULT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_42C84955A76ED395 (user_id), INDEX IDX_42C8495554177093 (room_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reservation_service (id INT AUTO_INCREMENT NOT NULL, reservation_id INT NOT NULL, service_id INT NOT NULL, quantity INT NOT NULL, INDEX IDX_86082157B83297E7 (reservation_id), INDEX IDX_86082157ED5CA9E6 (service_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE room (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(10) NOT NULL, type VARCHAR(20) NOT NULL, price DOUBLE PRECISION NOT NULL, status VARCHAR(20) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE service (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(50) NOT NULL, description LONGTEXT NOT NULL, price DOUBLE PRECISION NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation ADD CONSTRAINT FK_42C84955A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation ADD CONSTRAINT FK_42C8495554177093 FOREIGN KEY (room_id) REFERENCES room (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service ADD CONSTRAINT FK_86082157B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service ADD CONSTRAINT FK_86082157ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation DROP FOREIGN KEY FK_42C8495554177093
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service DROP FOREIGN KEY FK_86082157B83297E7
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reservation_service DROP FOREIGN KEY FK_86082157ED5CA9E6
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
            DROP TABLE service
        SQL);
    }
}
