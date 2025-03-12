-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: quiz
-- ------------------------------------------------------
-- Server version	9.0.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` binary(16) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role` enum('ADMIN','MOD','USER') DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UKsb8bbouer5wak8vyiiy4pf2bx` (`username`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (_binary '\"\à\Ål›D#„	\'¼u\Æm\Æ','anh.nt11111@gmail.com','Nguyá»…n Tuáº¥n Anh','$2a$10$.y6NAGpDwgard8vSRSd8g.2zcpzwUN46nWavBEojeRkj9ObgBr41q','tuananh11111','USER'),(_binary 'Sû¥‹©D–­IŒ››\ïñ','admin@gmail.com','admin','$2a$10$zgtFNFKfwjb7kyK9gMem2.UE6RQbRtVFk9RsdZjgCnkQP.7J380kG','admin','ADMIN'),(_binary 'U\íqY«K±¡\é™.¶ü','daidoan16081@gmail.com','ÄoÃ n Minh Äáº¡i 111','$2a$10$oi3CUkG2vrnvNw1OrmIjnuo.JJgeLul0F6xe03/ACEb1AUxGEaXdS','daidoan16081','USER'),(_binary 'r=¿+ipNs¬d€™\äÀø','anh.nt@gmail.com','Nguyá»…n Tuáº¥n Anh','$2a$10$.44KrnLRH.vhPxjFHbJVZOsf5WLBENcMllfk33YoKG//V3QtO/U7K','tuananh','USER'),(_binary '£jp\ê75N$…\rJ\×ô™öm','dsdfgsdfs@gmail.com','Doan minh dai','$2a$10$BnPFi3tRBPbOGrKboCdFgeumgeypEYN/AVDhl6oc38Vm66MbDfxD.','dai','USER'),(_binary 'Ä¤¬ù¯Kj¶òfþ†º','anh.nt1111@gmail.com','Nguyá»…n Tuáº¥n Anh','$2a$10$Gtp9XrhlqiqUwaWsYgfKbOpZ/F0D5HHGBbxAnuwHDzE7d9i8eyetC','tuananh1111','USER'),(_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù','daidoan1608@gmail.com','ÄoÃ n Minh Äáº¡i','$2a$10$OwlzOKfbKM1lKJ67hBwkGOCMk574shp00fx3H5PEG/OxqKQgWV5p.','daidoan1608','USER'),(_binary '\âz>¿ÿI‡‘Å®ƒ(*ª<','mod@gmail.com','mod','$2a$10$UnODJBwxsSoxggB6rA.He.4doFliUSf2du/4NHVW5EJZik3CImoeO','mod','MOD');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-12 12:07:11
