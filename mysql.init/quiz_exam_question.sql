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
-- Table structure for table `exam_question`
--

DROP TABLE IF EXISTS `exam_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_question` (
  `exam_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  PRIMARY KEY (`exam_id`,`question_id`),
  KEY `FKhence37m8dce4mwluboy8vabx` (`question_id`),
  CONSTRAINT `FK75y5n4rt15oyfmshrwwi73d` FOREIGN KEY (`exam_id`) REFERENCES `exam` (`exam_id`),
  CONSTRAINT `FKhence37m8dce4mwluboy8vabx` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_question`
--

LOCK TABLES `exam_question` WRITE;
/*!40000 ALTER TABLE `exam_question` DISABLE KEYS */;
INSERT INTO `exam_question` VALUES (1,1),(1,2),(1,3),(2,4),(3,4),(1,5),(3,5),(1,6),(2,6),(3,6),(1,7),(3,7),(1,8),(3,8),(1,9),(2,9),(1,10),(2,10),(1,11),(2,11),(1,12),(2,12),(1,13),(2,13),(3,13),(1,14),(3,14),(1,15),(2,15),(1,16),(3,16),(1,17),(2,17),(3,17),(1,18),(2,18),(1,19),(2,19),(1,20),(3,20),(1,21),(2,21),(3,21),(1,22),(2,22),(1,23),(3,23),(1,24),(3,24),(1,25),(3,25),(2,26),(1,27),(2,27),(3,27),(1,28),(3,28),(1,29),(2,29),(3,29),(1,30),(2,30),(2,31),(3,31),(1,33),(2,33),(3,33),(1,34),(2,34),(3,34);
/*!40000 ALTER TABLE `exam_question` ENABLE KEYS */;
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
