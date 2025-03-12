CREATE DATABASE  IF NOT EXISTS `quiz` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quiz`;
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
-- Table structure for table `answer`
--

DROP TABLE IF EXISTS `answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answer` (
  `is_correct` bit(1) NOT NULL,
  `option_id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `content` varchar(255) NOT NULL,
  PRIMARY KEY (`option_id`),
  KEY `FK8frr4bcabmmeyyu60qt7iiblo` (`question_id`),
  CONSTRAINT `FK8frr4bcabmmeyyu60qt7iiblo` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer`
--

LOCK TABLES `answer` WRITE;
/*!40000 ALTER TABLE `answer` DISABLE KEYS */;
INSERT INTO `answer` VALUES (_binary '\0',1,1,'Truyá»n tham sá» trong cÃ¡c thanh ghi.'),(_binary '\0',2,1,'Tham sá» ÄÆ°á»£c chá»©a trong má»t báº£ng trong bá» nhá», vÃ  Äá»a chá» cá»§a báº£ng ÄÆ°á»£c truyá»n nhÆ° má»t tham sá» trong má»t thanh ghi.'),(_binary '',3,1,'Tham sá» ÄÆ°á»£c chá»©a trong má»t báº£ng trong bá» nhá», vÃ  Äá»a chá» cá»§a báº£ng ÄÆ°á»£c truyá»n nhÆ° má»t tham sá» trong má»t vÃ¹ng bá» nhá» khÃ¡c.'),(_binary '\0',4,1,'Äáº©y (push) cÃ¡c tham sá» vÃ o stack báº±ng chÆ°Æ¡ng trÃ¬nh, vÃ  láº¥y ra khá»i stack (pop) bá»i HÄH.'),(_binary '\0',5,2,'Cung cáº¥p giao diá»n láº­p trÃ¬nh cho cÃ¡c dá»ch vá»¥ cá»§a HÄH.'),(_binary '',6,2,'ThÆ°á»ng ÄÆ°á»£c viáº¿t báº±ng má»t ngÃ´n ngá»¯ báº­c tháº¥p, gáº§n vá»i ngÃ´n ngá»¯ mÃ¡y.'),(_binary '\0',7,2,'Háº§u háº¿t ÄÆ°á»£c truy nháº­p bá»i cÃ¡c chÆ°Æ¡ng trÃ¬nh thÃ´ng qua má»t giao diá»n láº­p trÃ¬nh á»©ng dá»¥ng (API) báº­c cao, Ã­t khi sá»­ dá»¥ng trá»±c tiáº¿p system call.'),(_binary '\0',8,2,'Ba API phá» biáº¿n nháº¥t lÃ  Win32 API, POSIX API, vÃ  Java API.'),(_binary '\0',9,3,'Lá»p kernel'),(_binary '\0',10,3,'Lá»p cÃ¡c chÆ°Æ¡ng trÃ¬nh há» thá»ng vÃ  chÆ°Æ¡ng trÃ¬nh á»©ng dá»¥ng'),(_binary '',11,3,'Táº¥t cáº£ cÃ¡c lá»p trÃªn.'),(_binary '\0',12,4,'PhÃ¢n phá»i tÃ i nguyÃªn'),(_binary '\0',13,4,'Theo dÃµi tÃ i khoáº£n (accounting)'),(_binary '\0',14,4,'Báº£o vá» vÃ  an ninh'),(_binary '',15,4,'Thá»±c hiá»n chÆ°Æ¡ng trÃ¬nh'),(_binary '\0',16,5,'Cung cáº¥p sá»± báº£o vá» hoÃ n toÃ n cÃ¡c tÃ i nguyÃªn há» thá»ng'),(_binary '\0',17,5,'LÃ½ tÆ°á»ng cho viá»c nghiÃªn cá»©u vÃ  phÃ¡t triá»n cÃ¡c HÄH'),(_binary '',18,5,'Chia sáº» trá»±c tiáº¿p cÃ¡c tÃ i nguyÃªn'),(_binary '\0',19,5,'KhÃ³ thá»±c hiá»n'),(_binary '\0',20,6,'CÃ³ thá» viáº¿t nhanh hÆ¡n'),(_binary '\0',21,6,'MÃ£ cÃ´ Äá»ng hÆ¡n, dá» hiá»u vÃ  dá» gá»¡ lá»i hÆ¡n'),(_binary '',22,6,'GiÃºp HÄH thá»±c thi nhanh hÆ¡n'),(_binary '\0',23,6,'Dá» dÃ ng hÆ¡n khi mang HÄ Äáº·t vÃ o pháº§n cá»©ng má»i.'),(_binary '\0',24,7,'Sá»­ dá»¥ng phÆ°Æ¡ng phÃ¡p hÆ°á»ng Äá»i tÆ°á»£ng'),(_binary '',25,7,'CÃ¡c thÃ nh pháº§n háº¡t nhÃ¢n gáº¯n bÃ³ cháº·t cháº½ vá»i nhau'),(_binary '\0',26,7,'Má»i thÃ nh pháº§n giao tiáº¿p vá»i cÃ¡c thÃ nh pháº§n khÃ¡c qua giao diá»n ÄÃ£ Äá»nh trÆ°á»c'),(_binary '\0',27,7,'Má»i thÃ nh pháº§n lÃ  cÃ³ thá» náº¡p vÃ o trong kernel khi cáº§n thiáº¿t'),(_binary '\0',28,8,'ÄÆ¡n giáº£n'),(_binary '\0',29,8,'PhÃ¢n lá»p'),(_binary '\0',30,8,'Vi nhÃ¢n'),(_binary '',31,8,'MÃ´-Äun'),(_binary '\0',32,9,'Thá»±c hiá»n chÆ°Æ¡ng trÃ¬nh'),(_binary '\0',33,9,'Thá»±c hiá»n vÃ o-ra'),(_binary '\0',34,9,'Thao tÃ¡c vá»i há» thá»ng file'),(_binary '',35,9,'Báº£o vá» vÃ  an ninh'),(_binary '\0',36,10,'Dá» dÃ ng má» rá»ng há» Äiá»u hÃ nh mÃ  khÃ´ng pháº£i thay Äá»i kernel'),(_binary '\0',37,10,'Dá» dÃ ng mang má»t HÄH Äáº·t vÃ o nhá»¯ng kiáº¿n trÃºc khÃ¡c'),(_binary '\0',38,10,'ÄÃ¡ng tin cáº­y hÆ¡n vÃ  an toÃ n hÆ¡n'),(_binary '',39,10,'GiÃºp tÄng hiá»u nÄng thá»±c thi cá»§a há» thá»ng'),(_binary '\0',40,11,'Khi bá» ngáº¯t'),(_binary '\0',41,11,'Khi ÄÆ°á»£c trÃ¬nh láº­p lá»ch Äiá»u váº­n (giáº£i quyáº¿t!)'),(_binary '\0',42,11,'Khi vÃ o-ra hoáº·c má»t sá»± kiá»n nÃ o ÄÃ³ káº¿t thÃºc'),(_binary '',43,11,'Khi Äá»£i vÃ o-ra hoáº·c Äá»£i má»t sá»± kiá»n nÃ o ÄÃ³ xuáº¥t hiá»n'),(_binary '\0',44,12,'TrÃ¬nh láº­p lá»ch dÃ i ká»³ lá»±a chá»n nhá»¯ng tiáº¿n trÃ¬nh nÃ o nÃªn ÄÆ°á»£c ÄÆ°a tá»« ÄÄ©a vÃ o trong ready queue.'),(_binary '',45,12,'TrÃ¬nh láº­p lá»ch dÃ i ká»³ cáº§n ÄÆ°á»£c sá»­ dá»¥ng Äáº¿n thÆ°á»ng xuyÃªn hÆ¡n trÃ¬nh láº­p lá»ch ngáº¯n ká»³.'),(_binary '\0',46,12,'TrÃ¬nh láº­p lá»ch ngáº¯n ká»³ lá»±a chá»n tiáº¿n trÃ¬nh nÃ o nÃªn ÄÆ°á»£c thá»±c hiá»n káº¿ tiáº¿p vÃ  phÃ¢n phá»i CPU cho nÃ³.'),(_binary '\0',47,12,'Má»t sá» HÄH (vd: HÄH chia sáº» thá»i gian) cáº§n cÃ³ thÃªm trÃ¬nh láº­p lá»ch trung ká»³ Äá» thá»±c hiá»n swapping.'),(_binary '\0',48,13,'Khi bá» ngáº¯t'),(_binary '',49,13,'Khi ÄÆ°á»£c trÃ¬nh láº­p lá»ch Äiá»u váº­n (giáº£i quyáº¿t!)'),(_binary '\0',50,13,'Khi vÃ o-ra hoáº·c má»t sá»± kiá»n nÃ o ÄÃ³ káº¿t thÃºc'),(_binary '\0',51,13,'Khi Äá»£i vÃ o-ra hoáº·c Äá»£i má»t sá»± kiá»n nÃ o ÄÃ³ xuáº¥t hiá»n'),(_binary '\0',52,14,'Tiáº¿n trÃ¬nh cÃ³ thá» tá»± káº¿t thÃºc khi thá»±c hiá»n xong cÃ¢u lá»nh cuá»i cÃ¹ng.'),(_binary '\0',53,14,'Tiáº¿n trÃ¬nh cha cháº¥m dá»©t tiáº¿n trÃ¬nh con khi tiáº¿n trÃ¬nh con dÃ¹ng quÃ¡ tÃ i nguyÃªn ÄÆ°á»£c phÃ©p.'),(_binary '\0',54,14,'Tiáº¿n trÃ¬nh cha cháº¥m dá»©t tiáº¿n trÃ¬nh con khi nhiá»m vá»¥ cá»§a tiáº¿n trÃ¬nh con khÃ´ng cÃ²n cáº§n thiáº¿t.'),(_binary '',55,14,'Tiáº¿n trÃ¬nh con ÄÆ°á»£c phÃ©p cá»§a tiáº¿n trÃ¬nh Ã´ng Äá» tá»n táº¡i vÃ  cháº¥m dá»©t tiáº¿n trÃ¬nh cha.'),(_binary '\0',56,15,'Tiáº¿n trÃ¬nh cha táº¡o cÃ¡c tiáº¿n trÃ¬nh con, tiáº¿n trÃ¬nh con táº¡o cÃ¡c tiáº¿n trÃ¬nh chÃ¡u.'),(_binary '\0',57,15,'Táº¡o tiáº¿n trÃ¬nh lÃ  má»t cÃ´ng viá»c náº·ng vÃ¬ tá»n nhiá»u tÃ i nguyÃªn.'),(_binary '\0',58,15,'Tiáº¿n trÃ¬nh cha vÃ  con cÃ³ thá» thá»±c hiá»n Äá»ng thá»i.'),(_binary '',59,15,'Tiáº¿n trÃ¬nh con Äá»£i cho Äáº¿n khi tiáº¿n trÃ¬nh cha káº¿t thÃºc rá»i nÃ³ káº¿t thÃºc.'),(_binary '\0',60,16,'Tiáº¿n trÃ¬nh cha vÃ  con chia sáº» táº¥t cáº£ cÃ¡c tÃ i nguyÃªn.'),(_binary '\0',61,16,'Tiáº¿n trÃ¬nh con ÄÆ°á»£c chia sáº» táº­p con tÃ i nguyÃªn cá»§a tiáº¿n trÃ¬nh cha.'),(_binary '\0',62,16,'Tiáº¿n trÃ¬nh cha vÃ  con khÃ´ng cÃ³ sá»± chia sáº» tÃ i nguyÃªn.'),(_binary '',63,16,'Táº¥t cáº£ cÃ¡c phÆ°Æ¡ng Ã¡n trÃªn Äá»u cÃ³ thá» xáº£y ra.'),(_binary '\0',64,17,'Send(Q, message) vÃ  Receive(P, message)'),(_binary '',65,17,'Send(P, message) vÃ  Receive(Q, message)'),(_binary '\0',66,17,'Send(A, message) vÃ  Receive(A, message)'),(_binary '\0',67,17,'Send(Q, A, message) vÃ  Receive(P, A, message)'),(_binary '\0',68,18,'Job queue'),(_binary '\0',69,18,'Ready queue'),(_binary '',70,18,'Running queue'),(_binary '\0',71,18,'Device queue'),(_binary '\0',72,19,'FIFO'),(_binary '\0',73,19,'LIFO'),(_binary '\0',74,19,'Priority queue'),(_binary '',75,19,'Tree'),(_binary '',76,20,'Khi bá» ngáº¯t'),(_binary '\0',77,20,'Khi ÄÆ°á»£c trÃ¬nh láº­p lá»ch Äiá»u váº­n (giáº£i quyáº¿t!)'),(_binary '\0',78,20,'Khi vÃ o-ra hoáº·c má»t sá»± kiá»n nÃ o ÄÃ³ káº¿t thÃºc'),(_binary '\0',79,20,'Khi Äá»£i vÃ o-ra hoáº·c Äá»£i má»t sá»± kiá»n nÃ o ÄÃ³ xuáº¥t hiá»n'),(_binary '\0',80,21,'One-to-One'),(_binary '',81,21,'One-to-Many'),(_binary '\0',82,21,'Many-to-One'),(_binary '\0',83,21,'Many-to-Many'),(_binary '\0',84,22,'Viá»c táº¡o luá»ng vÃ  láº­p lá»ch ÄÆ°á»£c thá»±c hiá»n trong khÃ´ng gian kernel.'),(_binary '',85,22,'Viá»c táº¡o vÃ  quáº£n lÃ½ cÃ¡c kernel thread nhanh hÆ¡n so vá»i cÃ¡c user thread.'),(_binary '\0',86,22,'Náº¿u 1 user thread gá»i 1 system call khÃ³a, tiáº¿n trÃ¬nh khÃ´ng bá» khÃ³a vÃ¬ kernel cÃ³ thá» láº­p lá»ch má»t luá»ng má»i.'),(_binary '\0',87,23,'tiáº¿n trÃ¬nh, server, luá»ng, pool'),(_binary '\0',88,23,'pool, tiáº¿n trÃ¬nh, server, luá»ng'),(_binary '\0',89,23,'luá»ng, tiáº¿n trÃ¬nh, pool, server'),(_binary '',90,23,'server, luá»ng, tiáº¿n trÃ¬nh, pool'),(_binary '\0',91,24,'Viá»c táº¡o luá»ng vÃ  láº­p lá»ch ÄÆ°á»£c thá»±c hiá»n trong khÃ´ng gian ngÆ°á»i sá»­ dá»¥ng.'),(_binary '\0',92,24,'Viá»c táº¡o vÃ  quáº£n lÃ½ cÃ¡c user thread nhanh hÆ¡n so vá»i cÃ¡c kernel thread.'),(_binary '',93,24,'Trong mÃ´ hÃ¬nh many-to-many, náº¿u 1 user thread gá»i 1 system call khÃ³a sáº½ gÃ¢y cáº£ tiáº¿n trÃ¬nh khÃ³a.'),(_binary '\0',94,25,'Há» thá»ng khÃ´ng thá» tiáº¿p tá»¥c hoáº¡t Äá»ng.'),(_binary '\0',95,25,'Há» Äiá»u hÃ nh ÄÃ³ng bÄng cÃ¡c tiáº¿n trÃ¬nh.'),(_binary '',96,25,'CÃ¡c tiáº¿n trÃ¬nh khÃ´ng thá» tiáº¿p tá»¥c ÄÆ°á»£c thá»±c thi.'),(_binary '\0',97,25,'Má»i tiáº¿n trÃ¬nh Äá»u Äang yÃªu cáº§u sá»­ dá»¥ng CPU.'),(_binary '',98,26,'Starvation'),(_binary '\0',99,26,'Unsafe'),(_binary '\0',100,26,'Deadlock'),(_binary '\0',101,26,'Low resource.'),(_binary '\0',102,27,'n'),(_binary '\0',103,27,'n * m'),(_binary '\0',104,27,'m'),(_binary '',105,27,'n + m'),(_binary '\0',106,28,'Tiáº¿n trÃ¬nh náº¡n nhÃ¢n cáº§n bao nhiÃªu tÃ i nguyÃªn Äá» cÃ³ thá» cháº¡y tiáº¿p.'),(_binary '',107,28,'Tráº¡ng thÃ¡i deadlock cá»§a há» thá»ng lÃ  do tiáº¿n trÃ¬nh nÃ o gÃ¢y ra.'),(_binary '\0',108,28,'Thá»i gian mÃ  tiáº¿n trÃ¬nh náº¡n nhÃ¢n ÄÃ£ váº­n hÃ nh vÃ  tiáº¿p tá»¥c cáº§n Äá» cháº¡y.'),(_binary '\0',109,28,'Tiáº¿n trÃ¬nh náº¡n nhÃ¢n lÃ  Äá»c láº­p (interactive) hay theo bÃ³ (batch).'),(_binary '\0',110,29,'Loáº¡i trá»« tÆ°Æ¡ng há» (Mutual Exclusion).'),(_binary '',111,29,'Há» thá»ng thiáº¿u thá»n tÃ i nguyÃªn (Starvation)'),(_binary '\0',112,29,'Giá»¯ vÃ  chá» (Hold and wait).'),(_binary '\0',113,29,'KhÃ´ng thá» chiáº¿m láº¡i tÃ i nguyÃªn (No preemption).'),(_binary '\0',114,30,'use â request â release.'),(_binary '\0',115,30,'release â request â use.'),(_binary '\0',116,30,'release â use â request.'),(_binary '',117,30,'request â use â release.'),(_binary '',118,31,'Há» thá»ng chá» cÃ³ thá» bá» deadlock khi nÃ³ cÃ³ tráº¡ng thÃ¡i khÃ´ng an toÃ n.'),(_binary '\0',119,31,'Há» thá»ng váº«n cÃ³ thá» bá» deadlock khi nÃ³ Äang an toÃ n.'),(_binary '\0',120,31,'An toÃ n vÃ  deadlock lÃ  2 khÃ¡i niá»m cÃ¹ng chá» 1 tráº¡ng thÃ¡i.'),(_binary '\0',121,31,'Há» thá»ng sáº½ bá» deadlock khi nÃ³ cÃ³ tráº¡ng thÃ¡i khÃ´ng an toÃ n.'),(_binary '\0',122,32,'Chá» ra má»t thá»© tá»± thá»±c thi cÃ¡c tiáº¿n trÃ¬nh sau khi há» thá»ng bá» deadlock.'),(_binary '',123,32,'Chá» ra má»t thá»© tá»± thá»±c thi cá»§a cÃ¡c tiáº¿n trÃ¬nh sao cho há» thá»ng luÃ´n an toÃ n.'),(_binary '\0',124,32,'TÃ¬m ra thá»© tá»± náº¡p vÃ o há» thá»ng cÃ¡c chÆ°Æ¡ng trÃ¬nh mÃ  ngÆ°á»i dÃ¹ng yÃªu cáº§u.'),(_binary '\0',125,32,'TÃ¬m ra nhá»¯ng chuá»i khÃ´ng an toÃ n trong há» thá»ng Äá» phÃ²ng trá»«.'),(_binary '',126,33,'O(m * n*n)'),(_binary '\0',127,33,'O(1)'),(_binary '\0',128,33,'O(n)'),(_binary '\0',129,33,'O(m * n)'),(_binary '\0',130,34,'Äá» thá» khÃ´ng cÃ³ chu trÃ¬nh thÃ¬ há» thá»ng khÃ´ng bá» deadlock.'),(_binary '',131,34,'Äá» thá» cÃ³ chu trÃ¬nh thÃ¬ há» thá»ng bá» deadlock.'),(_binary '\0',132,34,'Táº­p Äá»nh V gá»m cÃ³ 2 loáº¡i lÃ  tiáº¿n trÃ¬nh vÃ  tÃ i nguyÃªn.'),(_binary '\0',133,34,'TÃ i nguyÃªn cÃ³ thá» cÃ³ nhiá»u thá»±c thá».');
/*!40000 ALTER TABLE `answer` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapter`
--

LOCK TABLES `chapter` WRITE;
/*!40000 ALTER TABLE `chapter` DISABLE KEYS */;
INSERT INTO `chapter` VALUES (1,1,5,'Giá»i thiá»u chung'),(2,2,5,'Cáº¥u trÃºc mÃ¡y tÃ­nh'),(3,3,5,'Há» Äiá»u HÃ nh'),(4,4,5,'Máº¡ng mÃ¡y tÃ­nh'),(5,5,5,'CÆ¡ sá» dá»¯ liá»u'),(6,6,5,'Thuáº­t toÃ¡n vÃ  nguyÃªn lÃ½ láº­p trÃ¬nh'),(7,7,5,'CÃ¡c váº¥n Äá» xÃ£ há»i cá»§a cÃ´ng nghá» thÃ´ng tin'),(1,8,1,'Introduction'),(2,9,1,'Os Structure'),(3,10,1,'Process'),(4,11,1,'Thresh'),(5,12,1,'CPU scheduling'),(6,13,1,'Process Synchronization'),(7,14,1,'Deadlock'),(8,15,1,'Main Memory'),(9,16,1,'Virtual Memory'),(10,17,1,'IO and disk scheduling'),(11,18,1,'File');
/*!40000 ALTER TABLE `chapter` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam`
--

LOCK TABLES `exam` WRITE;
/*!40000 ALTER TABLE `exam` DISABLE KEYS */;
INSERT INTO `exam` VALUES ('2024-12-20',25,1,1,_binary 'Sû¥©D­I\ïñ','Äá» thi thá»­ mÃ´n NguyÃªn lÃ½ há» Äiá»u hÃ nh','Äá» sá» 1');
/*!40000 ALTER TABLE `exam` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_question`
--

LOCK TABLES `exam_question` WRITE;
/*!40000 ALTER TABLE `exam_question` DISABLE KEYS */;
INSERT INTO `exam_question` VALUES (1,1),(1,2),(1,3),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25),(1,27),(1,28),(1,29),(1,30),(1,33),(1,34);
/*!40000 ALTER TABLE `exam_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `chapter_id` bigint NOT NULL,
  `question_id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(500) NOT NULL,
  `difficulty` enum('EASY','HARD','MEDIUM') DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `FKrms5bmu5xtol6rxcv4pnckcpm` (`chapter_id`),
  CONSTRAINT `FKrms5bmu5xtol6rxcv4pnckcpm` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`chapter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (9,1,'XÃ¡c Äá»nh ÄÃ¢u khÃ´ng pháº£i lÃ  cÃ¡ch thá»©c truyá»n tham sá» cho cÃ¡c system call?','MEDIUM'),(9,2,'XÃ¡c Äá»nh phÆ°Æ¡ng Ã¡n sai khi nÃ³i Äáº¿n cÃ¡c system call:','MEDIUM'),(9,3,'Lá»p pháº§n cá»©ng:','EASY'),(9,4,'XÃ¡c Äá»nh ÄÃ¢u khÃ´ng pháº£i lÃ  má»t chá»©c nÄng cá»§a HÄH Äá» Äáº£m báº£o cho hoáº¡t Äá»ng hiá»u quáº£ cá»§a chÃ­nh nÃ³:','MEDIUM'),(9,5,'Chá» ra ÄÃ¢u khÃ´ng pháº£i lÃ  má»t Äáº·c Äiá»m cá»§a Virtual Machine:','HARD'),(9,6,'Chá» ra ÄÃ¢u khÃ´ng pháº£i lÃ  má»t lá»£i Äiá»m cá»§a HÄH ÄÆ°á»£c viáº¿t báº±ng ngÃ´n ngá»¯ báº­c cao?','MEDIUM'),(9,7,'Chá» ra ÄÃ¢u khÃ´ng pháº£i lÃ  Äáº·c Äiá»m cá»§a viá»c xÃ¢y dá»±ng cÃ¡c HÄH cáº¥u trÃºc mÃ´-Äun:','HARD'),(9,8,'HÄH Solaris cÃ³ cáº¥u trÃºc dáº¡ng:','MEDIUM'),(9,9,'XÃ¡c Äá»nh ÄÃ¢u khÃ´ng pháº£i lÃ  má»t dá»ch vá»¥ cá»§a HÄH cung cáº¥p cÃ¡c chá»©c nÄng há»¯u dá»¥ng trá»±c tiáº¿p cho cÃ¡c user:','MEDIUM'),(9,10,'Chá» ra ÄÃ¢u khÃ´ng pháº£i lÃ  lá»£i Äiá»m chÃ­nh ÄÆ°á»£c Äá» cáº­p cá»§a HÄH vi nhÃ¢n?','MEDIUM'),(10,11,'Khi nÃ o tiáº¿n trÃ¬nh chuyá»n tá»« tráº¡ng thÃ¡i cháº¡y sang tráº¡ng thÃ¡i Äá»£i?','MEDIUM'),(10,12,'XÃ¡c Äá»nh phÆ°Æ¡ng Ã¡n sai khi nÃ³i tá»i cÃ¡c trÃ¬nh láº­p lá»ch tiáº¿n trÃ¬nh:','MEDIUM'),(10,13,'Khi nÃ o tiáº¿n trÃ¬nh chuyá»n tá»« tráº¡ng thÃ¡i sáºµn sÃ ng sang tráº¡ng thÃ¡i cháº¡y?','MEDIUM'),(10,14,'XÃ¡c Äá»nh phÆ°Æ¡ng Ã¡n khÃ´ng thá» xáº£y ra khi nÃ³i tá»i sá»± káº¿t thÃºc tiáº¿n trÃ¬nh:','MEDIUM'),(10,15,'XÃ¡c Äá»nh phÆ°Æ¡ng Ã¡n sai khi nÃ³i tá»i cÃ¡c tiáº¿n trÃ¬nh:','MEDIUM'),(10,16,'XÃ¡c Äá»nh phÆ°Æ¡ng Ã¡n ÄÃºng khi lá»±a chá»n chia sáº» tÃ i nguyÃªn giá»¯a tiáº¿n trÃ¬nh cha vÃ  con:','EASY'),(10,17,'Trong giao tiáº¿p trá»±c tiáº¿p giá»¯a cÃ¡c tiáº¿n trÃ¬nh, khi tiáº¿n trÃ¬nh P gá»­i thÃ´ng Äiá»p cho tiáº¿n trÃ¬nh Q, hoáº¡t Äá»ng nÃ o sau ÄÃ¢y ÄÆ°á»£c thá»±c hiá»n?','MEDIUM'),(10,18,'XÃ¡c Äá»nh loáº¡i queue nÃ o khÃ´ng ÄÆ°á»£c sá»­ dá»¥ng trong láº­p lá»ch tiáº¿n trÃ¬nh:','MEDIUM'),(10,19,'CÃ¡c Äá»nh kiá»u tá» chá»©c nÃ o khÃ´ng ÄÆ°á»£c sá»­ dá»¥ng cho ready queue khi láº­p lá»ch tiáº¿n trÃ¬nh:','MEDIUM'),(10,20,'Khi nÃ o tiáº¿n trÃ¬nh chuyá»n tá»« tráº¡ng thÃ¡i cháº¡y sang tráº¡ng thÃ¡i sáºµn sÃ ng?','MEDIUM'),(11,21,'Chá» ra má»¥c nÃ o sau ÄÃ¢y khÃ´ng pháº£i lÃ  má»t mÃ´ hÃ¬nh Äa luá»ng phá» biáº¿n?','MEDIUM'),(11,22,'Chá» ra phÆ°Æ¡ng Ã¡n sai khi nÃ³i tá»i cÃ¡c kernel thread:','MEDIUM'),(11,23,'XÃ¡c Äá»nh thá»© tá»± ÄÃºng cá»§a cÃ¡c tá»« cáº§n Äiá»n khi nÃ³i Äáº¿n cÃ¡c thread pool: TÆ° tÆ°á»ng cá»§a thread pool lÃ  táº¡o nhiá»u luá»ng táº¡i lÃºc báº¯t Äáº§u â¦â¦â¦ vÃ  Äáº·t chÃºng vÃ o má»t pool - nÆ¡i chÃºng \"ngá»i\" vÃ  Äá»£i viá»c. Khi â¦â¦â¦ nháº­n má»t yÃªu cáº§u, nÃ³ \"ÄÃ¡nh thá»©c\" má»t â¦â¦â¦ trong pool - náº¿u nÃ³ sáºµn sÃ ng - truyá»n cho nÃ³ yÃªu cáº§u Äá» phá»¥c vá»¥. Khi hoÃ n thÃ nh, luá»ng láº¡i trá» vá» â¦â¦â¦ chá» cÃ´ng viá»c khÃ¡c.','HARD'),(11,24,'Chá» ra phÆ°Æ¡ng Ã¡n sai khi nÃ³i tá»i cÃ¡c user thread:','MEDIUM'),(14,25,'Deadlock lÃ  tráº¡ng thÃ¡i nhÆ° tháº¿ nÃ o?','MEDIUM'),(14,26,'Tráº¡ng thÃ¡i mÃ  má»t há» thá»ng mÃ¡y tÃ­nh cÃ³ cÃ¡c tiáº¿n trÃ¬nh váº«n hoáº¡t Äá»ng nhÆ°ng thá»i gian ÄÃ¡p á»©ng ráº¥t lÃ¢u lÃ  gÃ¬?','MEDIUM'),(14,27,'Äá» thá» RAG cá»§a má»t há» thá»ng mÃ´ táº£ cho n tiáº¿n trÃ¬nh vÃ  m tÃ i nguyÃªn thÃ¬ cÃ³ bao nhiÃªu Äá»nh (lá»±c lÆ°á»£ng cá»§a táº­p Äá»nh V)?','MEDIUM'),(14,28,'Khi há» thá»ng xáº£y ra deadlock, há» Äiá»u hÃ nh pháº£i chá»n má»t tiáº¿n trÃ¬nh (náº¡n nhÃ¢n) Äá» káº¿t thÃºc. TÃ­nh cháº¥t nÃ o sau ÄÃ¢y sáº½ KHÃNG ÄÆ°á»£c quan tÃ¢m?','MEDIUM'),(14,29,'Yáº¿u tá» nÃ o sau ÄÃ¢y khÃ´ng pháº£i lÃ  má»t Äáº·c trÆ°ng cá»§a Deadlock?','MEDIUM'),(14,30,'Thá»© tá»± cá»§a quy trÃ¬nh yÃªu cáº§u cáº¥p phÃ¡t tÃ i nguyÃªn lÃ :','MEDIUM'),(14,31,'Quan há» giá»¯a âan toÃ nâ vÃ  âdeadlockâ ÄÆ°á»£c diá»n Äáº¡t nhÆ° tháº¿ nÃ o?','MEDIUM'),(14,32,'Má»¥c tiÃªu cá»§a giáº£i thuáº­t âNhÃ  bÄngâ (Banker) lÃ  gÃ¬?','HARD'),(14,33,'Má»t há» thá»ng cÃ³ n tiáº¿n trÃ¬nh vÃ  m loáº¡i tÃ i nguyÃªn vÃ  Äang á» tráº¡ng thÃ¡i Deadlock. LÃºc ÄÃ³, náº¿u cháº¡y giáº£i thuáº­t âPhÃ¡t hiá»n deadlockâ (Detection Algorithm) thÃ¬ Äá» phá»©c táº¡p lÃ ','HARD'),(14,34,'PhÃ¡t biá»u nÃ o sau ÄÃ¢y SAI vá» Äá» thá» cáº¥p phÃ¡t tÃ i nguyÃªn:','MEDIUM');
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `token` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `revoked` bit(1) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`token`),
  KEY `FKjwc9veyjcjfkej6rnnbsijfvh` (`user_id`),
  CONSTRAINT `FKjwc9veyjcjfkej6rnnbsijfvh` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (_binary '\r%ª7\r@^\Ì.*CZ*','2024-12-26 02:59:24.020000','2025-01-02 02:59:23.981000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary '±9vWHúo\ÜM4\Ù','2024-12-26 22:44:47.823000','2025-01-02 22:44:47.789000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '4,\Ô	*@ ©\\Mjõ0','2024-12-26 19:35:45.015000','2025-01-02 19:35:44.957000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '3`UúðFk,¤¢u(','2024-12-27 01:50:01.102000','2025-01-03 01:50:01.070000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 'P²T¼kI7³¶\Û\Åi','2024-12-26 04:33:06.350000','2025-01-02 04:33:06.340000',_binary '',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 'S¸@\éL²®(Tª','2024-12-26 02:37:20.152000','2025-01-02 02:37:20.111000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary 'V¾\Ã8¿·Fÿ Y','2024-12-26 01:39:44.181000','2025-01-02 01:39:44.136000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary 'j,Ò®|ÀEØ³\ÝH\ÐOû\â','2024-12-26 21:22:14.196000','2025-01-02 21:22:14.194000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 'qo¼ÞEm«ñ½Cjt','2024-12-27 16:28:03.756000','2025-01-03 16:28:03.546000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 't*¾\äøNI\ëf|','2024-12-26 01:41:56.097000','2025-01-02 01:41:55.803000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary '}Å¬BöCs¡ýj,¶\Ï\ÑQ','2024-12-26 21:08:28.905000','2025-01-02 21:08:28.903000',_binary '',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '}ð\'mEj(Ng>2','2024-12-26 04:35:45.833000','2025-01-02 04:35:45.831000',_binary '',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '~;Î¤A\ÂA4­Ã¤U\Þ\Å','2024-12-27 01:38:19.939000','2025-01-03 01:38:19.899000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 'I	\Í\ÉC\å¯;l¡\ß','2024-12-26 04:02:25.449000','2025-01-02 04:02:25.447000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '_\é\Â\ÈN}Ò#ú`¢','2024-12-26 04:01:30.420000','2025-01-02 04:01:30.418000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '\Â-.ñ L3§òqA','2024-12-26 04:00:49.582000','2025-01-02 04:00:49.549000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary 'Ü(þ\æ\æF¥Ql*w\Ý(','2024-12-27 16:35:28.345000','2025-01-03 16:35:28.179000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '\å~\ØmXNY_(úÀ\Zh','2024-12-25 22:27:00.183000','2025-01-01 22:27:00.147000',_binary '',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '\ç\Ø3NÈ©À®ù¨','2024-12-26 03:24:30.464000','2025-01-02 03:24:30.428000',_binary '',_binary 'Sû¥©D­I\ïñ'),(_binary 'ë@kFa?1Yõ6','2024-12-26 02:38:24.745000','2025-01-02 02:38:24.706000',_binary '\0',_binary 'Sû¥©D­I\ïñ'),(_binary '\ìvy4@ýºxÿªX¢Q','2024-12-27 01:57:01.588000','2025-01-03 01:57:01.551000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary '\ïo\ç*¨G©V\ãtÝ´','2024-12-27 16:39:04.815000','2025-01-03 16:39:04.798000',_binary '\0',_binary 'Ä¤¬ù¯Kj¶òfþº'),(_binary 'öv\çmB6¾>¦b¤+Z','2024-12-27 16:27:17.782000','2025-01-03 16:27:17.745000',_binary '\0',_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(_binary 'úvh¾\é1IH¥(±}VºY','2024-12-25 22:52:24.519000','2025-01-01 22:52:24.482000',_binary '\0',_binary 'Sû¥©D­I\ïñ');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject` (
  `subject_id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES (1,NULL,'NguyÃªn lÃ½ há» Äiá»u hÃ nh 1'),(2,NULL,'Máº¡ng mÃ¡y tÃ­nh'),(3,NULL,'Kiáº¿n trÃºc mÃ¡y tÃ­nh vÃ  vi xá»­ lÃ½'),(4,NULL,'Kinh táº¿ chÃ­nh trá» MÃ¡c - LÃªnin'),(5,NULL,'Tin há»c cÆ¡ sá»');
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (_binary '9²ð~A¹°\ä\ÃNu§¬','anh.nt11@gmail.com','Nguyá»n Tuáº¥n Anh','$2a$10$0N9YrHWrk3DqEWwBxCgZL.mBynGT7O5m1Bv2QgsZ2y0zNjzFoM2qu','tuananh11','USER'),(_binary 'RYBJÍ\éU\ÓØ©õ¦','daidoan160800@gmail.com','ÄoÃ n Minh Äáº¡i','123456','daidoan160800','USER'),(_binary 'Sû¥©D­I\ïñ','admin@gmail.com','admin','$2a$10$zgtFNFKfwjb7kyK9gMem2.UE6RQbRtVFk9RsdZjgCnkQP.7J380kG','admin','ADMIN'),(_binary 'U\íqY«K±¡\é.¶ü','daidoan16081@gmail.com','ÄoÃ n Minh Äáº¡i 111','$2a$10$zLwBSCticT7u.pAh6evGKubkDkoPb6dLQmrOHE4NKaw5CP018IkgG','daidoan16081','USER'),(_binary 'V¾7~¦\ÈF,®bü÷\Ü\ç','admin1@gmail.com','NgÆ°á»i dÃ¹ng má»i','$2a$10$0sEDNnTHF4i4GdA8Ex9s0uillUoFF8ZOwOx5goX.i53yefFaN.yXK','admin1','USER'),(_binary 'Xª¨óJNc ¿\Ý\á7¸|H','user2@gmail.com','NgÆ°á»i dÃ¹ng má»i 2','$2a$10$WYBi1pOEGkPsaSDkVhAeVuy8lhcbK3Mz6w.wYDPGTE6d1.3m9kvX.','user2','USER'),(_binary 'r=¿+ipNs¬d\äÀø','anh.nt@gmail.com','Nguyá»n Tuáº¥n Anh','$2a$10$.44KrnLRH.vhPxjFHbJVZOsf5WLBENcMllfk33YoKG//V3QtO/U7K','tuananh','USER'),(_binary 'DC)ñ\ÜN«´±6G^9÷\æ','anh.nt1@gmail.com','Nguyá»n Tuáº¥n Anh','$2a$10$yVHWbEFBa3u8/Yfu1c33se1g0dZRjnoSU0pQcN3UjIDNoP3bhP692','tuananh1','USER'),(_binary 'Ä¤¬ù¯Kj¶òfþº','anh.nt1111@gmail.com','Nguyá»n Tuáº¥n Anh','$2a$10$Gtp9XrhlqiqUwaWsYgfKbOpZ/F0D5HHGBbxAnuwHDzE7d9i8eyetC','tuananh1111','USER'),(_binary '\ÞSpsrL~¬\\\Ò$\Îù','daidoan1608@gmail.com','ÄoÃ n Minh Äáº¡i','$2a$10$/lGG/eQdyHR3DD5wkw04OeqbMo/NBJ9HVNSng650wWi395dd4aRRe','daidoan1608','USER'),(_binary '\âz>¿ÿIÅ®(*ª<','mod@gmail.com','mod','$2a$10$UnODJBwxsSoxggB6rA.He.4doFliUSf2du/4NHVW5EJZik3CImoeO','mod','MOD'),(_binary '\ã1Ý£üLÄ\'Ëõ7j','daidoan1608001@gmail.com','ÄoÃ n Minh Äáº¡i','$2a$10$.3DwiFvLy5h.iIYCGcZL1.lvLcyiw1dqUFDiYrZVODdF5E9DnvfHK','daidoan1608001','USER'),(_binary '\ç ø¢\Ô@£ù¢õ\Øõ','anh.nt111@gmail.com','Nguyá»n Tuáº¥n Anh','$2a$10$Fpvp.lRMdCvA6jXcGkY4vuZeboyJ12c7NUUiX9Bhp4kl4EVPWC2kW','tuananh111','USER');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_answers`
--

LOCK TABLES `user_answers` WRITE;
/*!40000 ALTER TABLE `user_answers` DISABLE KEYS */;
INSERT INTO `user_answers` VALUES (28,10,1,2),(37,13,2,2),(19,7,3,2),(31,11,4,2),(13,5,5,2),(4,2,6,2),(10,4,7,2),(16,6,8,2),(44,15,9,2),(40,14,10,2),(129,33,11,6),(131,34,12,6),(28,10,13,7),(37,13,14,7),(19,7,15,7),(31,11,16,7),(13,5,17,7),(4,2,18,7),(10,4,19,7),(16,6,20,7),(44,15,21,7),(40,14,22,7),(1,1,23,8),(5,2,24,8),(9,3,25,8),(16,5,26,8),(20,6,27,8),(24,7,28,8),(28,8,29,8),(32,9,30,8),(36,10,31,8),(40,11,32,8),(44,12,33,8),(48,13,34,8),(52,14,35,8),(56,15,36,8),(60,16,37,8),(64,17,38,8),(68,18,39,8),(72,19,40,8),(76,20,41,8),(80,21,42,8),(84,22,43,8),(87,23,44,8),(91,24,45,8),(94,25,46,8),(102,27,47,8),(106,28,48,8),(110,29,49,8),(114,30,50,8),(126,33,51,8),(130,34,52,8),(1,1,53,9),(5,2,54,9),(9,3,55,9),(16,5,56,9),(20,6,57,9),(24,7,58,9),(28,8,59,9),(32,9,60,9),(36,10,61,9),(40,11,62,9),(44,12,63,9),(49,13,64,9),(52,14,65,9),(58,15,66,9),(61,16,67,9),(64,17,68,9),(68,18,69,9),(72,19,70,9),(76,20,71,9),(80,21,72,9),(84,22,73,9),(87,23,74,9),(91,24,75,9),(94,25,76,9),(102,27,77,9),(106,28,78,9),(110,29,79,9),(116,30,80,9),(126,33,81,9),(130,34,82,9),(1,1,83,10),(5,2,84,10),(9,3,85,10),(16,5,86,10),(20,6,87,10),(1,1,88,11),(5,2,89,11),(9,3,90,11),(16,5,91,11),(1,1,92,18),(5,2,93,18),(9,3,94,18),(16,5,95,18),(20,6,96,18),(24,7,97,18),(28,8,98,18),(32,9,99,18);
/*!40000 ALTER TABLE `user_answers` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_exam`
--

LOCK TABLES `user_exam` WRITE;
/*!40000 ALTER TABLE `user_exam` DISABLE KEYS */;
INSERT INTO `user_exam` VALUES (85.5,'2024-12-12 12:00:00.000000',1,'2024-12-12 10:00:00.000000',2,_binary 'U\íqY«K±¡\é.¶ü'),(6.66667,'2024-12-24 11:48:47.795000',1,'2024-12-12 10:00:00.000000',3,_binary 'U\íqY«K±¡\é.¶ü'),(0,'2024-12-24 11:50:56.431000',1,'2024-12-12 10:00:00.000000',4,_binary 'U\íqY«K±¡\é.¶ü'),(16.6667,'2024-12-24 11:51:33.104000',1,'2024-12-12 10:00:00.000000',5,_binary 'U\íqY«K±¡\é.¶ü'),(3.33333,'2024-12-24 11:53:01.162000',1,'2024-12-12 10:00:00.000000',6,_binary 'U\íqY«K±¡\é.¶ü'),(85.5,'2024-12-12 12:00:00.000000',1,'2024-12-12 10:00:00.000000',7,_binary 'U\íqY«K±¡\é.¶ü'),(6.66667,'2024-12-24 13:23:57.365000',1,'2024-12-24 13:04:53.797000',8,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(10,'2024-12-25 15:27:52.477000',1,'2024-12-25 15:27:05.303000',9,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(0,'2024-12-26 13:12:57.590000',1,'2024-12-26 13:12:49.211000',10,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(0,'2024-12-26 13:49:16.056000',1,'2024-12-26 13:49:08.545000',11,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:07.777000',1,'2024-12-26 14:12:07.772000',12,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:07.777000',1,'2024-12-26 14:12:07.772000',13,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:17.363000',1,'2024-12-26 14:12:17.360000',14,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:12:17.364000',1,'2024-12-26 14:12:17.360000',15,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:18:33.825000',1,'2024-12-26 14:18:33.821000',16,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(NULL,'2024-12-26 14:18:33.825000',1,'2024-12-26 14:18:33.821000',17,_binary '\ÞSpsrL~¬\\\Ò$\Îù'),(0,'2024-12-26 14:22:54.003000',1,'2024-12-26 14:22:42.568000',18,_binary '\ÞSpsrL~¬\\\Ò$\Îù');
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

-- Dump completed on 2024-12-27 16:42:16
