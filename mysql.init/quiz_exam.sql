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
-- Table structure for table `exam`
--

DROP TABLE IF EXISTS `exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam` (
  `created_time` date NOT NULL,
  `duration` int NOT NULL,
  `exam_id` bigint NOT NULL AUTO_INCREMENT,
  `subject_id` bigint NOT NULL,
  `created_by` binary(16) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`exam_id`),
  KEY `FKo99y1c1rj2adr54ca8ldt7cho` (`created_by`),
  KEY `FKos7g6kn2748ll3ofc3w163gxh` (`subject_id`),
  CONSTRAINT `FKo99y1c1rj2adr54ca8ldt7cho` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`),
  CONSTRAINT `FKos7g6kn2748ll3ofc3w163gxh` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam`
--

LOCK TABLES `exam` WRITE;
/*!40000 ALTER TABLE `exam` DISABLE KEYS */;
INSERT INTO `exam` VALUES ('2024-12-20',25,1,1,_binary 'S˚•ã©Dñ≠Iåõõ\ÔÒ','ƒê·ªÅ thi th·ª≠ m√¥n Nguy√™n l√Ω h·ªá ƒëi·ªÅu h√†nh','ƒê·ªÅ s·ªë 1'),('2025-01-08',30,2,1,_binary 'S˚•ã©Dñ≠Iåõõ\ÔÒ','ƒê·ªÅ thi m√¥n nguy√™n l√Ω h·ªá ƒëi·ªÅu h√†nh','ƒê·ªÅ s·ªë 1'),('2025-01-10',15,3,1,_binary 'S˚•ã©Dñ≠Iåõõ\ÔÒ','','ƒê·ªÅ s·ªë 2');
/*!40000 ALTER TABLE `exam` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-12 12:07:10
