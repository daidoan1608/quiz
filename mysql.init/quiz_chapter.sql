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
-- Table structure for table `chapter`
--

DROP TABLE IF EXISTS `chapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapter` (
  `chapter_number` int NOT NULL,
  `chapter_id` bigint NOT NULL AUTO_INCREMENT,
  `subject_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`chapter_id`),
  KEY `FK1ud8idx7x6ut5lmxuoy8dl3yh` (`subject_id`),
  CONSTRAINT `FK1ud8idx7x6ut5lmxuoy8dl3yh` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapter`
--

LOCK TABLES `chapter` WRITE;
/*!40000 ALTER TABLE `chapter` DISABLE KEYS */;
INSERT INTO `chapter` VALUES (1,1,5,'Giới thiệu chung'),(2,2,5,'Cấu trúc máy tính'),(3,3,5,'Hệ Điều Hành'),(4,4,5,'Mạng máy tính'),(5,5,5,'Cơ sở dữ liệu'),(6,6,5,'Thuật toán và nguyên lý lập trình'),(7,7,5,'Các vấn đề xã hội của công nghệ thông tin'),(1,8,1,'Introduction'),(2,9,1,'Os Structure'),(3,10,1,'Process'),(4,11,1,'Thresh'),(5,12,1,'CPU scheduling'),(6,13,1,'Process Synchronization'),(7,14,1,'Deadlock'),(8,15,1,'Main Memory'),(9,16,1,'Virtual Memory'),(10,17,1,'IO and disk scheduling'),(11,18,1,'File');
/*!40000 ALTER TABLE `chapter` ENABLE KEYS */;
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
