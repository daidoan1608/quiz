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
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer`
--

LOCK TABLES `answer` WRITE;
/*!40000 ALTER TABLE `answer` DISABLE KEYS */;
INSERT INTO `answer` VALUES (_binary '\0',1,1,'Truyền tham số trong các thanh ghi.'),(_binary '\0',2,1,'Tham số được chứa trong một bảng trong bộ nhớ, và địa chỉ của bảng được truyền như một tham số trong một thanh ghi.'),(_binary '',3,1,'Tham số được chứa trong một bảng trong bộ nhớ, và địa chỉ của bảng được truyền như một tham số trong một vùng bộ nhớ khác.'),(_binary '\0',4,1,'Đẩy (push) các tham số vào stack bằng chương trình, và lấy ra khỏi stack (pop) bởi HĐH.'),(_binary '\0',5,2,'Cung cấp giao diện lập trình cho các dịch vụ của HĐH.'),(_binary '',6,2,'Thường được viết bằng một ngôn ngữ bậc thấp, gần với ngôn ngữ máy.'),(_binary '\0',7,2,'Hầu hết được truy nhập bởi các chương trình thông qua một giao diện lập trình ứng dụng (API) bậc cao, ít khi sử dụng trực tiếp system call.'),(_binary '\0',8,2,'Ba API phổ biến nhất là Win32 API, POSIX API, và Java API.'),(_binary '\0',9,3,'Lớp kernel'),(_binary '\0',10,3,'Lớp các chương trình hệ thống và chương trình ứng dụng'),(_binary '',11,3,'Tất cả các lớp trên.'),(_binary '\0',12,4,'Phân phối tài nguyên'),(_binary '\0',13,4,'Theo dõi tài khoản (accounting)'),(_binary '\0',14,4,'Bảo vệ và an ninh'),(_binary '',15,4,'Thực hiện chương trình'),(_binary '\0',16,5,'Cung cấp sự bảo vệ hoàn toàn các tài nguyên hệ thống'),(_binary '\0',17,5,'Lý tưởng cho việc nghiên cứu và phát triển các HĐH'),(_binary '',18,5,'Chia sẻ trực tiếp các tài nguyên'),(_binary '\0',19,5,'Khó thực hiện'),(_binary '\0',20,6,'Có thể viết nhanh hơn'),(_binary '\0',21,6,'Mã cô đọng hơn, dễ hiểu và dễ gỡ lỗi hơn'),(_binary '',22,6,'Giúp HĐH thực thi nhanh hơn'),(_binary '\0',23,6,'Dễ dàng hơn khi mang HĐ đặt vào phần cứng mới.'),(_binary '\0',24,7,'Sử dụng phương pháp hướng đối tượng'),(_binary '',25,7,'Các thành phần hạt nhân gắn bó chặt chẽ với nhau'),(_binary '\0',26,7,'Mỗi thành phần giao tiếp với các thành phần khác qua giao diện đã định trước'),(_binary '\0',27,7,'Mỗi thành phần là có thể nạp vào trong kernel khi cần thiết'),(_binary '\0',28,8,'Đơn giản'),(_binary '\0',29,8,'Phân lớp'),(_binary '\0',30,8,'Vi nhân'),(_binary '',31,8,'Mô-đun'),(_binary '\0',32,9,'Thực hiện chương trình'),(_binary '\0',33,9,'Thực hiện vào-ra'),(_binary '\0',34,9,'Thao tác với hệ thống file'),(_binary '',35,9,'Bảo vệ và an ninh'),(_binary '\0',36,10,'Dễ dàng mở rộng hệ điều hành mà không phải thay đổi kernel'),(_binary '\0',37,10,'Dễ dàng mang một HĐH đặt vào những kiến trúc khác'),(_binary '\0',38,10,'Đáng tin cậy hơn và an toàn hơn'),(_binary '',39,10,'Giúp tăng hiệu năng thực thi của hệ thống'),(_binary '\0',40,11,'Khi bị ngắt'),(_binary '\0',41,11,'Khi được trình lập lịch điều vận (giải quyết!)'),(_binary '\0',42,11,'Khi vào-ra hoặc một sự kiện nào đó kết thúc'),(_binary '',43,11,'Khi đợi vào-ra hoặc đợi một sự kiện nào đó xuất hiện'),(_binary '\0',44,12,'Trình lập lịch dài kỳ lựa chọn những tiến trình nào nên được đưa từ đĩa vào trong ready queue.'),(_binary '',45,12,'Trình lập lịch dài kỳ cần được sử dụng đến thường xuyên hơn trình lập lịch ngắn kỳ.'),(_binary '\0',46,12,'Trình lập lịch ngắn kỳ lựa chọn tiến trình nào nên được thực hiện kế tiếp và phân phối CPU cho nó.'),(_binary '\0',47,12,'Một số HĐH (vd: HĐH chia sẻ thời gian) cần có thêm trình lập lịch trung kỳ để thực hiện swapping.'),(_binary '\0',48,13,'Khi bị ngắt'),(_binary '',49,13,'Khi được trình lập lịch điều vận (giải quyết!)'),(_binary '\0',50,13,'Khi vào-ra hoặc một sự kiện nào đó kết thúc'),(_binary '\0',51,13,'Khi đợi vào-ra hoặc đợi một sự kiện nào đó xuất hiện'),(_binary '\0',52,14,'Tiến trình có thể tự kết thúc khi thực hiện xong câu lệnh cuối cùng.'),(_binary '\0',53,14,'Tiến trình cha chấm dứt tiến trình con khi tiến trình con dùng quá tài nguyên được phép.'),(_binary '\0',54,14,'Tiến trình cha chấm dứt tiến trình con khi nhiệm vụ của tiến trình con không còn cần thiết.'),(_binary '',55,14,'Tiến trình con được phép của tiến trình ông để tồn tại và chấm dứt tiến trình cha.'),(_binary '\0',56,15,'Tiến trình cha tạo các tiến trình con, tiến trình con tạo các tiến trình cháu.'),(_binary '\0',57,15,'Tạo tiến trình là một công việc nặng vì tốn nhiều tài nguyên.'),(_binary '\0',58,15,'Tiến trình cha và con có thể thực hiện đồng thời.'),(_binary '',59,15,'Tiến trình con đợi cho đến khi tiến trình cha kết thúc rồi nó kết thúc.'),(_binary '\0',60,16,'Tiến trình cha và con chia sẻ tất cả các tài nguyên.'),(_binary '\0',61,16,'Tiến trình con được chia sẻ tập con tài nguyên của tiến trình cha.'),(_binary '\0',62,16,'Tiến trình cha và con không có sự chia sẻ tài nguyên.'),(_binary '',63,16,'Tất cả các phương án trên đều có thể xảy ra.'),(_binary '\0',64,17,'Send(Q, message) và Receive(P, message)'),(_binary '',65,17,'Send(P, message) và Receive(Q, message)'),(_binary '\0',66,17,'Send(A, message) và Receive(A, message)'),(_binary '\0',67,17,'Send(Q, A, message) và Receive(P, A, message)'),(_binary '\0',68,18,'Job queue'),(_binary '\0',69,18,'Ready queue'),(_binary '',70,18,'Running queue'),(_binary '\0',71,18,'Device queue'),(_binary '\0',72,19,'FIFO'),(_binary '\0',73,19,'LIFO'),(_binary '\0',74,19,'Priority queue'),(_binary '',75,19,'Tree'),(_binary '',76,20,'Khi bị ngắt'),(_binary '\0',77,20,'Khi được trình lập lịch điều vận (giải quyết!)'),(_binary '\0',78,20,'Khi vào-ra hoặc một sự kiện nào đó kết thúc'),(_binary '\0',79,20,'Khi đợi vào-ra hoặc đợi một sự kiện nào đó xuất hiện'),(_binary '\0',80,21,'One-to-One'),(_binary '',81,21,'One-to-Many'),(_binary '\0',82,21,'Many-to-One'),(_binary '\0',83,21,'Many-to-Many'),(_binary '\0',84,22,'Việc tạo luồng và lập lịch được thực hiện trong không gian kernel.'),(_binary '',85,22,'Việc tạo và quản lý các kernel thread nhanh hơn so với các user thread.'),(_binary '\0',86,22,'Nếu 1 user thread gọi 1 system call khóa, tiến trình không bị khóa vì kernel có thể lập lịch một luồng mới.'),(_binary '\0',87,23,'tiến trình, server, luồng, pool'),(_binary '\0',88,23,'pool, tiến trình, server, luồng'),(_binary '\0',89,23,'luồng, tiến trình, pool, server'),(_binary '',90,23,'server, luồng, tiến trình, pool'),(_binary '\0',91,24,'Việc tạo luồng và lập lịch được thực hiện trong không gian người sử dụng.'),(_binary '\0',92,24,'Việc tạo và quản lý các user thread nhanh hơn so với các kernel thread.'),(_binary '',93,24,'Trong mô hình many-to-many, nếu 1 user thread gọi 1 system call khóa sẽ gây cả tiến trình khóa.'),(_binary '\0',94,25,'Hệ thống không thể tiếp tục hoạt động.'),(_binary '\0',95,25,'Hệ điều hành đóng băng các tiến trình.'),(_binary '',96,25,'Các tiến trình không thể tiếp tục được thực thi.'),(_binary '\0',97,25,'Mọi tiến trình đều đang yêu cầu sử dụng CPU.'),(_binary '',98,26,'Starvation'),(_binary '\0',99,26,'Unsafe'),(_binary '\0',100,26,'Deadlock'),(_binary '\0',101,26,'Low resource.'),(_binary '\0',102,27,'n'),(_binary '\0',103,27,'n * m'),(_binary '\0',104,27,'m'),(_binary '',105,27,'n + m'),(_binary '\0',106,28,'Tiến trình nạn nhân cần bao nhiêu tài nguyên để có thể chạy tiếp.'),(_binary '',107,28,'Trạng thái deadlock của hệ thống là do tiến trình nào gây ra.'),(_binary '\0',108,28,'Thời gian mà tiến trình nạn nhân đã vận hành và tiếp tục cần để chạy.'),(_binary '\0',109,28,'Tiến trình nạn nhân là độc lập (interactive) hay theo bó (batch).'),(_binary '\0',110,29,'Loại trừ tương hỗ (Mutual Exclusion).'),(_binary '',111,29,'Hệ thống thiếu thốn tài nguyên (Starvation)'),(_binary '\0',112,29,'Giữ và chờ (Hold and wait).'),(_binary '\0',113,29,'Không thể chiếm lại tài nguyên (No preemption).'),(_binary '\0',114,30,'use – request – release.'),(_binary '\0',115,30,'release – request – use.'),(_binary '\0',116,30,'release – use – request.'),(_binary '',117,30,'request – use – release.'),(_binary '',118,31,'Hệ thống chỉ có thể bị deadlock khi nó có trạng thái không an toàn.'),(_binary '\0',119,31,'Hệ thống vẫn có thể bị deadlock khi nó đang an toàn.'),(_binary '\0',120,31,'An toàn và deadlock là 2 khái niệm cùng chỉ 1 trạng thái.'),(_binary '\0',121,31,'Hệ thống sẽ bị deadlock khi nó có trạng thái không an toàn.'),(_binary '\0',122,32,'Chỉ ra một thứ tự thực thi các tiến trình sau khi hệ thống bị deadlock.'),(_binary '',123,32,'Chỉ ra một thứ tự thực thi của các tiến trình sao cho hệ thống luôn an toàn.'),(_binary '\0',124,32,'Tìm ra thứ tự nạp vào hệ thống các chương trình mà người dùng yêu cầu.'),(_binary '\0',125,32,'Tìm ra những chuỗi không an toàn trong hệ thống để phòng trừ.'),(_binary '',126,33,'O(m * n*n)'),(_binary '\0',127,33,'O(1)'),(_binary '\0',128,33,'O(n)'),(_binary '\0',129,33,'O(m * n)'),(_binary '\0',130,34,'Đồ thị không có chu trình thì hệ thống không bị deadlock.'),(_binary '',131,34,'Đồ thị có chu trình thì hệ thống bị deadlock.'),(_binary '\0',132,34,'Tập đỉnh V gồm có 2 loại là tiến trình và tài nguyên.'),(_binary '\0',133,34,'Tài nguyên có thể có nhiều thực thể.');
/*!40000 ALTER TABLE `answer` ENABLE KEYS */;
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
