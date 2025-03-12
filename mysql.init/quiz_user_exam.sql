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
-- Table structure for table `user_exam`
--

DROP TABLE IF EXISTS `user_exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_exam` (
  `score` float DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `exam_id` bigint NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `user_exam_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`user_exam_id`),
  KEY `FKl44lsl55re2s7jhjlh527y85l` (`exam_id`),
  KEY `FK30xxyjqs5y3dnq0qtb2o159ds` (`user_id`),
  CONSTRAINT `FK30xxyjqs5y3dnq0qtb2o159ds` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `FKl44lsl55re2s7jhjlh527y85l` FOREIGN KEY (`exam_id`) REFERENCES `exam` (`exam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_exam`
--

LOCK TABLES `user_exam` WRITE;
/*!40000 ALTER TABLE `user_exam` DISABLE KEYS */;
INSERT INTO `user_exam` VALUES (85.5,'2024-12-12 12:00:00.000000',1,'2024-12-12 10:00:00.000000',2,_binary 'U\íqY«K±¡\é™.¶ü'),(6.66667,'2024-12-24 11:48:47.795000',1,'2024-12-12 10:00:00.000000',3,_binary 'U\íqY«K±¡\é™.¶ü'),(0,'2024-12-24 11:50:56.431000',1,'2024-12-12 10:00:00.000000',4,_binary 'U\íqY«K±¡\é™.¶ü'),(16.6667,'2024-12-24 11:51:33.104000',1,'2024-12-12 10:00:00.000000',5,_binary 'U\íqY«K±¡\é™.¶ü'),(3.33333,'2024-12-24 11:53:01.162000',1,'2024-12-12 10:00:00.000000',6,_binary 'U\íqY«K±¡\é™.¶ü'),(85.5,'2024-12-12 12:00:00.000000',1,'2024-12-12 10:00:00.000000',7,_binary 'U\íqY«K±¡\é™.¶ü'),(6.66667,'2024-12-24 13:23:57.365000',1,'2024-12-24 13:04:53.797000',8,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(10,'2024-12-25 15:27:52.477000',1,'2024-12-25 15:27:05.303000',9,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2024-12-26 13:12:57.590000',1,'2024-12-26 13:12:49.211000',10,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2024-12-26 13:49:16.056000',1,'2024-12-26 13:49:08.545000',11,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:07.777000',1,'2024-12-26 14:12:07.772000',12,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:07.777000',1,'2024-12-26 14:12:07.772000',13,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:17.363000',1,'2024-12-26 14:12:17.360000',14,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:17.364000',1,'2024-12-26 14:12:17.360000',15,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:18:33.825000',1,'2024-12-26 14:18:33.821000',16,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-26 14:18:33.825000',1,'2024-12-26 14:18:33.821000',17,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2024-12-26 14:22:54.003000',1,'2024-12-26 14:22:42.568000',18,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 15:48:13.865000',1,'2024-12-28 15:48:13.861000',19,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 15:48:13.864000',1,'2024-12-28 15:48:13.861000',20,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 16:14:52.494000',1,'2024-12-28 16:14:52.491000',21,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 16:14:52.494000',1,'2024-12-28 16:14:52.491000',22,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 16:30:40.367000',1,'2024-12-28 16:30:40.363000',23,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(NULL,'2024-12-28 16:30:40.367000',1,'2024-12-28 16:30:40.363000',24,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(30,'2024-12-28 22:13:24.480000',1,'2024-12-28 22:08:16.460000',25,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2024-12-29 02:34:10.958000',1,'2024-12-29 02:32:16.019000',26,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2024-12-29 02:39:25.110000',1,'2024-12-29 02:38:19.361000',27,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(30,'2024-12-29 15:29:16.721000',1,'2024-12-29 15:28:37.017000',28,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(10,'2024-12-29 15:34:02.449000',1,'2024-12-29 15:33:55.600000',29,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(33.3333,'2024-12-30 10:32:43.756000',1,'2024-12-30 10:31:59.326000',30,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(23.3333,'2024-12-30 10:34:18.624000',1,'2024-12-30 10:31:59.326000',31,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(0,'2025-01-08 02:18:22.435000',1,'2025-01-08 02:18:12.201000',32,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù'),(10,'2025-01-08 12:56:51.357000',2,'2025-01-08 12:56:31.209000',33,_binary '\ÞSpsrL~¬Œ\\\Ò$\Îù');
/*!40000 ALTER TABLE `user_exam` ENABLE KEYS */;
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
