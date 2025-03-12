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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (9,1,'Xác định đâu không phải là cách thức truyền tham số cho các system call?','MEDIUM'),(9,2,'Xác định phương án sai khi nói đến các system call:','MEDIUM'),(9,3,'Lớp phần cứng:','EASY'),(9,4,'Xác định đâu không phải là một chức năng của HĐH để đảm bảo cho hoạt động hiệu quả của chính nó:','MEDIUM'),(9,5,'Chỉ ra đâu không phải là một đặc điểm của Virtual Machine:','HARD'),(9,6,'Chỉ ra đâu không phải là một lợi điểm của HĐH được viết bằng ngôn ngữ bậc cao?','MEDIUM'),(9,7,'Chỉ ra đâu không phải là đặc điểm của việc xây dựng các HĐH cấu trúc mô-đun:','HARD'),(9,8,'HĐH Solaris có cấu trúc dạng:','MEDIUM'),(9,9,'Xác định đâu không phải là một dịch vụ của HĐH cung cấp các chức năng hữu dụng trực tiếp cho các user:','MEDIUM'),(9,10,'Chỉ ra đâu không phải là lợi điểm chính được đề cập của HĐH vi nhân?','MEDIUM'),(10,11,'Khi nào tiến trình chuyển từ trạng thái chạy sang trạng thái đợi?','MEDIUM'),(10,12,'Xác định phương án sai khi nói tới các trình lập lịch tiến trình:','MEDIUM'),(10,13,'Khi nào tiến trình chuyển từ trạng thái sẵn sàng sang trạng thái chạy?','MEDIUM'),(10,14,'Xác định phương án không thể xảy ra khi nói tới sự kết thúc tiến trình:','MEDIUM'),(10,15,'Xác định phương án sai khi nói tới các tiến trình:','MEDIUM'),(10,16,'Xác định phương án đúng khi lựa chọn chia sẻ tài nguyên giữa tiến trình cha và con:','EASY'),(10,17,'Trong giao tiếp trực tiếp giữa các tiến trình, khi tiến trình P gửi thông điệp cho tiến trình Q, hoạt động nào sau đây được thực hiện?','MEDIUM'),(10,18,'Xác định loại queue nào không được sử dụng trong lập lịch tiến trình:','MEDIUM'),(10,19,'Các định kiểu tổ chức nào không được sử dụng cho ready queue khi lập lịch tiến trình:','MEDIUM'),(10,20,'Khi nào tiến trình chuyển từ trạng thái chạy sang trạng thái sẵn sàng?','MEDIUM'),(11,21,'Chỉ ra mục nào sau đây không phải là một mô hình đa luồng phổ biến?','MEDIUM'),(11,22,'Chỉ ra phương án sai khi nói tới các kernel thread:','MEDIUM'),(11,23,'Xác định thứ tự đúng của các từ cần điền khi nói đến các thread pool: Tư tưởng của thread pool là tạo nhiều luồng tại lúc bắt đầu ……… và đặt chúng vào một pool - nơi chúng \"ngồi\" và đợi việc. Khi ……… nhận một yêu cầu, nó \"đánh thức\" một ……… trong pool - nếu nó sẵn sàng - truyền cho nó yêu cầu để phục vụ. Khi hoàn thành, luồng lại trở về ……… chờ công việc khác.','HARD'),(11,24,'Chỉ ra phương án sai khi nói tới các user thread:','MEDIUM'),(14,25,'Deadlock là trạng thái như thế nào?','MEDIUM'),(14,26,'Trạng thái mà một hệ thống máy tính có các tiến trình vẫn hoạt động nhưng thời gian đáp ứng rất lâu là gì?','MEDIUM'),(14,27,'Đồ thị RAG của một hệ thống mô tả cho n tiến trình và m tài nguyên thì có bao nhiêu đỉnh (lực lượng của tập đỉnh V)?','MEDIUM'),(14,28,'Khi hệ thống xảy ra deadlock, hệ điều hành phải chọn một tiến trình (nạn nhân) để kết thúc. Tính chất nào sau đây sẽ KHÔNG được quan tâm?','MEDIUM'),(14,29,'Yếu tố nào sau đây không phải là một đặc trưng của Deadlock?','MEDIUM'),(14,30,'Thứ tự của quy trình yêu cầu cấp phát tài nguyên là:','MEDIUM'),(14,31,'Quan hệ giữa “an toàn” và “deadlock” được diễn đạt như thế nào?','MEDIUM'),(14,32,'Mục tiêu của giải thuật “Nhà băng” (Banker) là gì?','HARD'),(14,33,'Một hệ thống có n tiến trình và m loại tài nguyên và đang ở trạng thái Deadlock. Lúc đó, nếu chạy giải thuật “Phát hiện deadlock” (Detection Algorithm) thì độ phức tạp là','HARD'),(14,34,'Phát biểu nào sau đây SAI về đồ thị cấp phát tài nguyên:','MEDIUM');
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
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
