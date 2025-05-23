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
-- Table structure for table `user_answers`
--

DROP TABLE IF EXISTS `user_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_answers` (
  `option_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `user_answer_id` bigint NOT NULL AUTO_INCREMENT,
  `user_exam_id` bigint NOT NULL,
  PRIMARY KEY (`user_answer_id`),
  KEY `FKf0ahh8hh3ayn3ka0c2m86mxnt` (`option_id`),
  KEY `FKt29d6m4i30r0bw7rf1xx3afgf` (`question_id`),
  KEY `FKg17cww05h7wm37c96efgmoc85` (`user_exam_id`),
  CONSTRAINT `FKf0ahh8hh3ayn3ka0c2m86mxnt` FOREIGN KEY (`option_id`) REFERENCES `answer` (`option_id`),
  CONSTRAINT `FKg17cww05h7wm37c96efgmoc85` FOREIGN KEY (`user_exam_id`) REFERENCES `user_exam` (`user_exam_id`),
  CONSTRAINT `FKt29d6m4i30r0bw7rf1xx3afgf` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_answers`
--

LOCK TABLES `user_answers` WRITE;
/*!40000 ALTER TABLE `user_answers` DISABLE KEYS */;
INSERT INTO `user_answers` VALUES (28,10,1,2),(37,13,2,2),(19,7,3,2),(31,11,4,2),(13,5,5,2),(4,2,6,2),(10,4,7,2),(16,6,8,2),(44,15,9,2),(40,14,10,2),(129,33,11,6),(131,34,12,6),(28,10,13,7),(37,13,14,7),(19,7,15,7),(31,11,16,7),(13,5,17,7),(4,2,18,7),(10,4,19,7),(16,6,20,7),(44,15,21,7),(40,14,22,7),(1,1,23,8),(5,2,24,8),(9,3,25,8),(16,5,26,8),(20,6,27,8),(24,7,28,8),(28,8,29,8),(32,9,30,8),(36,10,31,8),(40,11,32,8),(44,12,33,8),(48,13,34,8),(52,14,35,8),(56,15,36,8),(60,16,37,8),(64,17,38,8),(68,18,39,8),(72,19,40,8),(76,20,41,8),(80,21,42,8),(84,22,43,8),(87,23,44,8),(91,24,45,8),(94,25,46,8),(102,27,47,8),(106,28,48,8),(110,29,49,8),(114,30,50,8),(126,33,51,8),(130,34,52,8),(1,1,53,9),(5,2,54,9),(9,3,55,9),(16,5,56,9),(20,6,57,9),(24,7,58,9),(28,8,59,9),(32,9,60,9),(36,10,61,9),(40,11,62,9),(44,12,63,9),(49,13,64,9),(52,14,65,9),(58,15,66,9),(61,16,67,9),(64,17,68,9),(68,18,69,9),(72,19,70,9),(76,20,71,9),(80,21,72,9),(84,22,73,9),(87,23,74,9),(91,24,75,9),(94,25,76,9),(102,27,77,9),(106,28,78,9),(110,29,79,9),(116,30,80,9),(126,33,81,9),(130,34,82,9),(1,1,83,10),(5,2,84,10),(9,3,85,10),(16,5,86,10),(20,6,87,10),(1,1,88,11),(5,2,89,11),(9,3,90,11),(16,5,91,11),(1,1,92,18),(5,2,93,18),(9,3,94,18),(16,5,95,18),(20,6,96,18),(24,7,97,18),(28,8,98,18),(32,9,99,18),(2,1,100,25),(6,2,101,25),(11,3,102,25),(17,5,103,25),(21,6,104,25),(25,7,105,25),(28,8,106,25),(32,9,107,25),(37,10,108,25),(41,11,109,25),(45,12,110,25),(49,13,111,25),(53,14,112,25),(57,15,113,25),(61,16,114,25),(64,17,115,25),(69,18,116,25),(72,19,117,25),(76,20,118,25),(80,21,119,25),(85,22,120,25),(88,23,121,25),(93,24,122,25),(94,25,123,25),(102,27,124,25),(106,28,125,25),(112,29,126,25),(117,30,127,25),(127,33,128,25),(132,34,129,25),(82,21,130,26),(1,1,131,28),(5,2,132,28),(9,3,133,28),(17,5,134,28),(21,6,135,28),(25,7,136,28),(29,8,137,28),(33,9,138,28),(37,10,139,28),(41,11,140,28),(45,12,141,28),(49,13,142,28),(55,14,143,28),(57,15,144,28),(61,16,145,28),(65,17,146,28),(70,18,147,28),(74,19,148,28),(78,20,149,28),(81,21,150,28),(84,22,151,28),(88,23,152,28),(92,24,153,28),(96,25,154,28),(103,27,155,28),(109,28,156,28),(112,29,157,28),(116,30,158,28),(128,33,159,28),(131,34,160,28),(3,1,161,29),(6,2,162,29),(131,34,163,29),(3,1,164,30),(7,2,165,30),(10,3,166,30),(17,5,167,30),(22,6,168,30),(27,7,169,30),(29,8,170,30),(35,9,171,30),(38,10,172,30),(43,11,173,30),(47,12,174,30),(49,13,175,30),(53,14,176,30),(57,15,177,30),(60,16,178,30),(65,17,179,30),(69,18,180,30),(74,19,181,30),(77,20,182,30),(82,21,183,30),(85,22,184,30),(89,23,185,30),(92,24,186,30),(95,25,187,30),(103,27,188,30),(107,28,189,30),(111,29,190,30),(115,30,191,30),(126,33,192,30),(130,34,193,30),(3,1,194,31),(6,2,195,31),(10,3,196,31),(17,5,197,31),(20,6,198,31),(24,7,199,31),(28,8,200,31),(32,9,201,31),(36,10,202,31),(41,11,203,31),(45,12,204,31),(49,13,205,31),(53,14,206,31),(57,15,207,31),(61,16,208,31),(65,17,209,31),(69,18,210,31),(73,19,211,31),(77,20,212,31),(81,21,213,31),(85,22,214,31),(88,23,215,31),(92,24,216,31),(95,25,217,31),(104,27,218,31),(108,28,219,31),(112,29,220,31),(116,30,221,31),(127,33,222,31),(130,34,223,31),(1,1,224,32),(5,2,225,32),(12,4,226,33),(20,6,227,33),(32,9,228,33),(36,10,229,33),(40,11,230,33),(44,12,231,33),(48,13,232,33),(56,15,233,33),(65,17,234,33),(69,18,235,33),(74,19,236,33),(81,21,237,33);
/*!40000 ALTER TABLE `user_answers` ENABLE KEYS */;
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
