-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: attendance_system
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `student_id` int NOT NULL,
  `session_id` int DEFAULT NULL,
  `date` date NOT NULL DEFAULT (curdate()),
  `time` time NOT NULL DEFAULT (curtime()),
  `status` enum('present','absent') DEFAULT 'absent',
  `signed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ipfs_cid` varchar(128) DEFAULT '',
  `data_hash` varchar(255) NOT NULL DEFAULT '',
  `onchain_txhash` varchar(80) DEFAULT '',
  `verified_by_device` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`session_id`,`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,123,NULL,'2025-10-30','00:09:57','present','2025-11-10 02:20:56',NULL,'',NULL,1),(2,1,123,1,'2025-10-30','01:56:20','present','2025-11-10 02:20:56',NULL,'',NULL,1),(3,1,123,2,'2025-10-30','01:56:38','present','2025-11-10 02:20:56',NULL,'',NULL,1),(4,1,123,3,'2025-10-31','17:13:10','present','2025-11-10 02:20:56',NULL,'',NULL,1),(5,1,123,4,'2025-10-31','17:14:21','present','2025-11-10 02:20:56',NULL,'',NULL,1),(6,1,123,5,'2025-10-31','18:06:00','present','2025-11-10 02:20:56',NULL,'',NULL,1),(7,1,123,6,'2025-10-31','18:09:27','present','2025-11-10 02:20:56',NULL,'',NULL,1),(8,1,123,7,'2025-10-31','18:11:12','present','2025-11-10 02:20:56',NULL,'',NULL,1),(9,1,123,8,'2025-10-31','18:27:41','present','2025-11-10 02:20:56',NULL,'',NULL,1),(10,1,123,9,'2025-10-31','18:28:52','present','2025-11-10 02:20:56',NULL,'',NULL,1),(11,1,123,11,'2025-10-31','18:33:51','present','2025-11-10 02:20:56',NULL,'',NULL,1),(12,1,123,12,'2025-10-31','18:38:53','present','2025-11-10 02:20:56',NULL,'',NULL,1),(13,1,123,13,'2025-10-31','18:43:20','present','2025-11-10 02:20:56',NULL,'',NULL,1),(14,1,123,14,'2025-10-31','18:49:55','present','2025-11-10 02:20:56',NULL,'',NULL,1),(15,1,123,15,'2025-10-31','18:56:41','present','2025-11-10 02:20:56',NULL,'',NULL,1),(16,1,123,16,'2025-10-31','18:57:24','present','2025-11-10 02:20:56',NULL,'',NULL,1),(17,1,123,17,'2025-10-31','19:03:46','present','2025-11-10 02:20:56',NULL,'',NULL,1),(18,1,123,18,'2025-10-31','19:04:14','present','2025-11-10 02:20:56',NULL,'',NULL,1),(19,1,123,19,'2025-10-31','19:04:33','present','2025-11-10 02:20:56',NULL,'',NULL,1),(20,1,123,20,'2025-10-31','19:08:57','present','2025-11-10 02:20:56',NULL,'',NULL,1),(21,1,123,22,'2025-10-31','19:12:55','present','2025-11-10 02:20:56',NULL,'',NULL,1),(22,1,123,23,'2025-10-31','19:13:14','present','2025-11-10 02:20:56',NULL,'',NULL,1),(23,1,123,24,'2025-10-31','19:19:40','present','2025-11-10 02:20:56',NULL,'',NULL,1),(24,1,1,25,'2025-10-31','19:47:11','present','2025-11-10 02:20:56',NULL,'',NULL,1),(25,1,1,26,'2025-10-31','21:49:47','present','2025-11-10 02:20:56',NULL,'',NULL,1),(26,1,2,26,'2025-10-31','21:49:52','present','2025-11-10 02:20:56',NULL,'',NULL,1),(27,4,2,27,'2025-10-31','21:51:24','present','2025-11-10 02:20:56',NULL,'',NULL,1),(28,4,1,27,'2025-10-31','21:51:29','present','2025-11-10 02:20:56',NULL,'',NULL,1),(29,1,1,28,'2025-11-07','16:21:28','present','2025-11-10 02:20:56',NULL,'',NULL,1),(30,1,1,33,'2025-11-08','14:02:54','present','2025-11-10 02:20:56',NULL,'',NULL,1),(31,1,1,34,'2025-11-08','14:08:51','present','2025-11-10 02:20:56',NULL,'',NULL,1),(32,1,1,49,'2025-11-09','00:28:01','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(33,1,2,49,'2025-11-09','00:28:01','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(35,1,1,50,'2025-11-09','01:53:04','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(36,1,2,50,'2025-11-09','01:53:04','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(38,1,1,51,'2025-11-09','01:57:29','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(39,1,2,51,'2025-11-09','01:57:29','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(41,1,1,52,'2025-11-09','02:04:16','present','2025-11-10 02:20:56',NULL,'',NULL,1),(42,1,2,52,'2025-11-09','02:04:01','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(47,1,1,53,'2025-11-09','02:32:56','present','2025-11-10 02:20:56',NULL,'',NULL,1),(48,1,2,53,'2025-11-09','02:32:40','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(52,1,1,54,'2025-11-09','02:34:23','present','2025-11-10 02:20:56',NULL,'',NULL,1),(53,1,2,54,'2025-11-09','02:34:18','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(56,1,1,55,'2025-11-09','02:35:14','present','2025-11-10 02:20:56',NULL,'',NULL,1),(57,1,2,55,'2025-11-09','02:35:09','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(60,1,1,56,'2025-11-09','02:49:48','present','2025-11-10 02:20:56',NULL,'',NULL,1),(61,1,2,56,'2025-11-09','02:49:27','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(66,1,1,57,'2025-11-09','02:50:57','present','2025-11-10 02:20:56',NULL,'',NULL,1),(67,1,2,57,'2025-11-09','02:50:53','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(70,1,1,58,'2025-11-09','02:53:24','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(71,1,2,58,'2025-11-09','02:53:24','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(73,1,1,59,'2025-11-09','02:59:20','present','2025-11-10 02:20:56',NULL,'',NULL,1),(74,1,2,59,'2025-11-09','02:59:17','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(77,1,1,60,'2025-11-09','03:05:06','present','2025-11-10 02:20:56',NULL,'',NULL,1),(78,1,2,60,'2025-11-09','03:04:58','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(81,1,1,61,'2025-11-09','03:05:26','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(82,1,2,61,'2025-11-09','03:05:26','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(84,1,1,62,'2025-11-09','11:26:07','present','2025-11-10 02:20:56',NULL,'',NULL,1),(85,1,2,62,'2025-11-09','03:26:04','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(88,1,1,63,'2025-11-09','11:38:36','present','2025-11-10 02:20:56',NULL,'',NULL,1),(89,1,2,63,'2025-11-09','03:38:30','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(91,1,1,64,'2025-11-09','11:46:55','present','2025-11-10 02:20:56',NULL,'',NULL,1),(92,1,2,64,'2025-11-09','03:46:51','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(94,1,1,65,'2025-11-09','11:47:58','present','2025-11-10 02:20:56',NULL,'',NULL,1),(95,1,2,65,'2025-11-09','03:47:50','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(98,1,1,66,'2025-11-09','19:55:30','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(99,1,2,66,'2025-11-09','19:55:30','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(101,1,1,67,'2025-11-10','03:56:37','present','2025-11-10 02:20:56',NULL,'',NULL,1),(102,1,2,67,'2025-11-09','19:56:35','absent','2025-11-10 02:20:56',NULL,'',NULL,1),(105,1,1,NULL,'2025-11-10','02:30:00','absent','2025-08-24 09:46:40','bafybeigdemoCID','90f016f148912c0944ee1bbcb45bfac8b247382df700450740df04b92324552a','0xe7d13a58379ddaccb96691c3f61b73cf943ecb3e5d55596a470420c5b103cc1f',1),(106,1,1,NULL,'2025-11-10','03:15:12','absent','2025-11-10 03:15:12','bafybeigdemoCID','e0fa726c6027dde1ef075183902e586199c1e76f1c816c3a082dab89de738660','0x56314edf041471ad3b649e5ba1633f7b985908b646bb9b686de3e01841c9cdfd',1),(107,1,1,69,'2025-11-10','03:22:04','absent','2025-11-10 03:22:04',NULL,'',NULL,1),(108,1,2,69,'2025-11-10','03:22:04','absent','2025-11-10 03:22:04',NULL,'',NULL,1),(110,1,1,NULL,'2025-11-10','03:22:11','absent','2025-11-10 03:22:11','bafybeigdemoCID','20d2053c88d2b542d32f0e58a68906415005b1954ddfd7371935c33a34daf6e2','0xc7450397f30beacb809b0f0cf261c0f3431a6fd2c776d60d82ba9ef0a066f437',1),(111,1,1,70,'2025-11-10','03:49:19','absent','2025-11-10 03:49:19','','','',1),(112,1,2,70,'2025-11-10','03:49:19','absent','2025-11-10 03:49:19','','','',1),(114,1,1,NULL,'2025-11-10','03:49:23','absent','2025-11-10 03:49:23','bafybeigdemoCID','a5c696ae988181f968cb8659257b1beec4f08905f3fc1fa8ece06e93f2dec0fc','0x9e259c10a536e5dd219a848002fff2555f89d4e5e9ca11f1b3cf060832b490ce',1),(115,1,1,71,'2025-11-10','03:50:25','absent','2025-11-10 03:50:25','','','',1),(116,1,2,71,'2025-11-10','03:50:25','absent','2025-11-10 03:50:25','','','',1),(118,1,1,NULL,'2025-11-10','03:50:34','absent','2025-11-10 03:50:34','bafybeigdemoCID','fc232a1b58d1fa3a4ca3bcd855f6222db51b9a763e40da580245d2efcc9ddc09','0x8ef3d40485205920aa596432ec2c5556de2b6997b298c8ded01aff7355725bb6',1),(119,1,1,72,'2025-11-10','04:26:48','present','2025-11-10 04:26:52','bafybeigdemoCID','d30d29455bfb93a9e4b393f24c01cb1aabb4fb4ca2339ac5963e88cf82c43010','0x670dba693f07574f181fe85e81b989d4ee094b01820e7094dc4019b286d33bd6',1),(120,1,2,72,'2025-11-10','04:26:48','absent','2025-11-10 04:26:48','','','',1),(122,6,2,73,'2025-11-10','11:02:36','present','2025-11-10 11:02:54','bafybeigdemoCID','89946b79c40d474ba61304dfebf8c457e582a39ecd5bfde30d4430b3ec0fad2b','0xaae87fd1f24e02de1f8e7644c991f0763a6f1c84f8f094efe93d741b009424fe',1),(123,6,2,74,'2025-11-10','12:38:36','present','2025-11-10 12:38:47','bafybeigdemoCID','71dd6df5dc9b386f52e8cc16d92a5be326c6ffc6486d43e12fa49f83c92456ad','0xef19f4eaabbc73d25d90b052890bc3ab294266bf8d537fc23c33ee3324b3001a',1),(124,6,2,75,'2025-11-10','13:23:32','present','2025-11-10 13:23:37','bafybeigdemoCID','c95607e32d27c9660a3e496485fa4567d85839daa9a39fc4b8fa2c4bb8b18769','0x9cd3a0143b13e6ccb52701b97f93217b886019a4a04335bd56b2ec824d50e8d5',1),(125,6,2,76,'2025-11-10','13:43:03','present','2025-11-10 13:43:06','bafybeigdemoCID','17ce3ee80e42c71fb20813c457ea7edd6c72129e024b20dc114afe15cae0d33d','0xd133afe00f76a276597d928d68083746953343b32d3574db5e795949478a3970',1),(126,6,2,77,'2025-11-10','13:49:18','present','2025-11-10 13:49:21','bafybeigdemoCID','385370fd4fdcc62f2db64eec21480ce5667ce6bda3d03bf7eadb5c041efc718a',NULL,1),(127,6,2,78,'2025-11-10','13:52:34','present','2025-11-10 13:52:42','bafybeigdemoCID','b91470d2745b0857864c2619be6f112b9d09e423a1130fd19d12fdd6845d3492',NULL,1),(128,6,2,79,'2025-11-10','15:02:18','present','2025-11-10 15:02:25','bafybeigdemoCID','8faff1e9fa833b1c6bffd1e5013ae03327610c3493f31f1b70202053e475693b',NULL,1),(129,6,2,NULL,'2025-11-10','15:02:36','present','2025-11-10 15:02:36','bafybeigdemoCID','d6f2ee682bb51bbbf4c90359dba92623e9d63e0d0ae012c9e6b826c03b80fcc7',NULL,1),(130,6,2,80,'2025-11-10','15:32:40','present','2025-11-10 15:32:47','bafybeigdemoCID','4527a45b47c333ca34a98c290f0bdfc8391839f7c1bf126db7e28e66f49fc9ad',NULL,1),(131,6,2,81,'2025-11-10','15:54:21','absent','2025-11-10 15:54:21','','','',1),(132,6,2,82,'2025-11-10','16:23:57','present','2025-11-10 16:24:01','bafybeigdemoCID','69a5a1e028df6499607a8499fde13d034a3c6542793d45cfe188eba3bb271a48',NULL,1),(133,6,2,83,'2025-11-10','16:24:57','present','2025-11-10 16:25:04','bafybeigdemoCID','d6e6a34f95efecbb06c11218c15f1d7bf32604abc2a63e3e21753f41b24112df',NULL,1),(134,6,2,84,'2025-11-10','16:46:40','present','2025-11-10 16:46:44','bafybeigdemoCID','5b834685ca95d6b8042e7de55a1ad085dfe99f5093c8ece60a9a53e1d6d4580d',NULL,1),(135,6,2,85,'2025-11-10','16:51:39','present','2025-11-10 16:51:51','bafybeigdemoCID','6be74bff2e58e6fbfa62b3503dc867f2b162f2e05202c54830c700557f953b9d',NULL,1),(136,6,2,86,'2025-11-10','17:21:44','present','2025-11-10 17:21:49','bafybeigdemoCID','0xc20c2cad84b8e9719bd7cb670abc459686facc0bc2b94d510ac970b60697e929',NULL,1),(137,6,2,87,'2025-11-10','17:32:12','present','2025-11-10 17:32:16','bafybeigdemoCID','0x12df1f341d5bb2721ac5a8121e51508c487fac41b6831f8cfd221e3cad04e560',NULL,1);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES (1,1,'2025-10-31 01:56:16',60,0),(2,1,'2025-10-31 01:56:35',60,0),(3,1,'2025-10-31 17:13:05',60,0),(4,1,'2025-10-31 17:14:17',60,0),(5,1,'2025-10-31 18:05:55',60,0),(6,1,'2025-10-31 18:09:23',60,0),(7,1,'2025-10-31 18:11:08',60,0),(8,1,'2025-10-31 18:27:37',60,0),(9,1,'2025-10-31 18:28:48',60,0),(10,1,'2025-10-31 18:33:31',60,0),(11,1,'2025-10-31 18:33:46',60,0),(12,1,'2025-10-31 18:38:50',60,0),(13,1,'2025-10-31 18:43:17',60,0),(14,1,'2025-10-31 18:49:53',60,0),(15,1,'2025-10-31 18:56:38',60,0),(16,1,'2025-10-31 18:57:19',60,0),(17,1,'2025-10-31 19:03:43',60,0),(18,1,'2025-10-31 19:04:09',60,0),(19,1,'2025-10-31 19:04:28',60,0),(20,1,'2025-10-31 19:08:54',60,0),(21,1,'2025-10-31 19:09:04',60,0),(22,1,'2025-10-31 19:12:51',60,0),(23,1,'2025-10-31 19:13:09',60,0),(24,1,'2025-10-31 19:19:37',60,0),(25,1,'2025-10-31 19:47:08',60,0),(26,1,'2025-10-31 21:49:42',60,0),(27,4,'2025-10-31 21:51:19',60,0),(28,1,'2025-11-07 16:21:23',60,0),(29,1,'2025-11-07 16:21:36',60,0),(30,1,'2025-11-07 16:22:09',10,0),(31,1,'2025-11-08 13:04:28',60,0),(32,1,'2025-11-08 14:02:23',60,0),(33,1,'2025-11-08 14:02:49',60,0),(34,1,'2025-11-08 14:08:46',60,0),(35,1,'2025-11-08 14:09:12',60,0),(36,1,'2025-11-08 14:42:02',60,0),(37,1,'2025-11-08 15:08:00',60,1),(38,1,'2025-11-08 15:09:23',60,0),(39,1,'2025-11-08 19:11:31',60,0),(40,1,'2025-11-08 19:27:11',60,0),(41,1,'2025-11-08 19:27:43',60,0),(42,1,'2025-11-08 19:38:56',60,0),(43,1,'2025-11-08 19:39:25',60,0),(44,1,'2025-11-08 20:14:10',60,1),(45,1,'2025-11-08 20:14:48',60,0),(46,1,'2025-11-08 20:28:31',60,0),(47,1,'2025-11-08 20:28:59',60,0),(48,1,'2025-11-08 23:47:45',60,0),(49,1,'2025-11-09 00:28:00',60,0),(50,1,'2025-11-09 01:53:04',60,0),(51,1,'2025-11-09 01:57:29',60,0),(52,1,'2025-11-09 02:04:01',60,0),(53,1,'2025-11-09 02:32:40',60,0),(54,1,'2025-11-09 02:34:18',60,0),(55,1,'2025-11-09 02:35:09',60,0),(56,1,'2025-11-09 02:49:27',60,0),(57,1,'2025-11-09 02:50:52',60,0),(58,1,'2025-11-09 02:53:24',60,0),(59,1,'2025-11-09 02:59:17',60,0),(60,1,'2025-11-09 03:04:58',60,0),(61,1,'2025-11-09 03:05:26',60,0),(62,1,'2025-11-09 03:26:04',60,0),(63,1,'2025-11-09 03:38:29',60,0),(64,1,'2025-11-09 03:46:51',60,0),(65,1,'2025-11-09 03:47:50',60,0),(66,1,'2025-11-09 19:55:28',60,0),(67,1,'2025-11-09 19:56:34',60,0),(68,1,'2025-11-10 03:15:05',60,0),(69,1,'2025-11-10 03:22:04',60,0),(70,1,'2025-11-10 03:49:18',60,0),(71,1,'2025-11-10 03:50:25',60,0),(72,1,'2025-11-10 04:26:47',60,0),(73,6,'2025-11-10 11:02:36',60,0),(74,6,'2025-11-10 12:38:36',60,0),(75,6,'2025-11-10 13:23:31',60,0),(76,6,'2025-11-10 13:43:03',60,0),(77,6,'2025-11-10 13:49:18',60,0),(78,6,'2025-11-10 13:52:34',60,0),(79,6,'2025-11-10 15:02:17',60,0),(80,6,'2025-11-10 15:32:40',60,0),(81,6,'2025-11-10 15:54:21',60,0),(82,6,'2025-11-10 16:23:57',60,0),(83,6,'2025-11-10 16:24:57',60,0),(84,6,'2025-11-10 16:46:40',60,0),(85,6,'2025-11-10 16:51:39',60,0),(86,6,'2025-11-10 17:21:44',60,0),(87,6,'2025-11-10 17:32:12',60,0);
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_students`
--

DROP TABLE IF EXISTS `course_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `student_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_students`
--

LOCK TABLES `course_students` WRITE;
/*!40000 ALTER TABLE `course_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `course_code` varchar(10) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_attendance_open` tinyint(1) DEFAULT '0',
  `current_session_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,1,'1','KOKUU3',NULL,'2025-10-28 19:20:05',0,NULL),(2,1,'微積分1','JG7V80',NULL,'2025-10-29 11:19:37',0,NULL),(3,1,'123','0K276A',NULL,'2025-10-29 11:22:12',0,NULL),(4,1,'微積分2','45CAIO',NULL,'2025-10-29 12:39:44',0,NULL),(5,2,'99','WVTK3C','123','2025-10-31 13:52:11',0,NULL),(6,2,'logic1','5E24YQ','logic 實驗','2025-11-10 03:02:13',0,NULL);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,1,1,'2025-10-29 15:44:11'),(2,1,4,'2025-10-30 08:06:56'),(6,2,1,'2025-10-31 13:49:19'),(7,2,4,'2025-10-31 13:50:40'),(8,1,5,'2025-10-31 13:52:25'),(9,2,6,'2025-11-10 03:02:31');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nonces`
--

DROP TABLE IF EXISTS `nonces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nonces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `nonce` varchar(64) NOT NULL,
  `issued_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_nonce` (`nonce`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nonces`
--

LOCK TABLES `nonces` WRITE;
/*!40000 ALTER TABLE `nonces` DISABLE KEYS */;
INSERT INTO `nonces` VALUES (1,1,0,'fe0d4398e655a718ba44d89d1766aee8','2025-11-10 01:07:05','2025-11-10 01:12:05',0),(2,1,0,'609fdc4482b2262036b0378419de24b4','2025-11-10 01:27:34','2025-11-10 01:32:34',0),(3,1,0,'52cabc3f30dc525054da00a3bafb7eb1','2025-11-10 01:31:48','2025-11-10 01:36:48',0),(4,1,1,'b0091128c2d97e06a134e25d3e1ebf43','2025-11-10 02:13:24','2025-11-10 02:18:24',0),(5,1,1,'30c14524e376b490f0471ed3d0380620','2025-11-10 02:22:49','2025-11-10 02:27:49',0),(6,1,1,'9b9ae1812f523dde49478ae9848f41e4','2025-11-10 02:29:29','2025-11-10 02:34:29',1),(7,1,1,'137d5cf9007ca7929b5be7d34d8acf78','2025-11-10 03:15:12','2025-11-10 03:20:12',1),(8,1,1,'432b180b903f430badc86534cddfe104','2025-11-10 03:22:11','2025-11-10 03:27:11',1),(9,1,1,'ddf41d5d956fac90ab1e47eac7a8fc67','2025-11-10 03:49:23','2025-11-10 03:54:23',1),(10,1,1,'16890af1330b04ea3590cddbb56abd9c','2025-11-10 03:50:34','2025-11-10 03:55:34',1),(11,1,1,'1ce4973dedf593cd2a1ed4a7cd176b61','2025-11-10 04:26:52','2025-11-10 04:31:52',1),(12,2,6,'a6ec7b981919ce7c510812cc8616b7aa','2025-11-10 11:02:54','2025-11-10 11:07:54',1),(13,2,6,'ec6e3e5ddcfc2c7d41aecca4f8a2645d','2025-11-10 12:38:47','2025-11-10 12:43:47',1),(14,2,6,'110ce6ff3ea64faf3e47fb970f366d70','2025-11-10 13:23:36','2025-11-10 13:28:36',1),(15,2,6,'07eca6d7bf34beae5926d97ecb8fa9c5','2025-11-10 13:43:06','2025-11-10 13:48:06',1),(16,2,6,'5634e954256aa7f8869872c304a9a394','2025-11-10 13:49:21','2025-11-10 13:54:21',1),(17,2,6,'d3c1009ced8707117b1e724714838ea2','2025-11-10 13:52:42','2025-11-10 13:57:42',1),(18,2,6,'afbab47365bbdbedda0bd72fadc784d9','2025-11-10 15:02:25','2025-11-10 15:07:25',1),(19,2,6,'fda84a5363fb26e1aca33e3600fbbe7a','2025-11-10 15:02:36','2025-11-10 15:07:36',1),(20,2,6,'dd07370b9e4bf51fdd4981bc0f4b4b7a','2025-11-10 15:32:47','2025-11-10 15:37:47',1),(21,2,6,'00cbca7acc07e2d8f0353452d712fd71','2025-11-10 16:24:01','2025-11-10 16:29:01',1),(22,2,6,'43fcbe2b28914b34d631771be9787f1a','2025-11-10 16:25:04','2025-11-10 16:30:04',1),(23,2,6,'c05f9628d637ef8d9edd06a98ba51262','2025-11-10 16:46:44','2025-11-10 16:51:44',1),(24,2,6,'051a1b6e65b2d53a6e83635a5c923e1d','2025-11-10 16:51:42','2025-11-10 16:56:42',1),(25,2,6,'31f93cbb0857da90d68dad95c52c1b67','2025-11-10 16:51:51','2025-11-10 16:56:51',1),(26,2,6,'12c32d236cef8c203b0c945e08ff6be8','2025-11-10 17:21:49','2025-11-10 17:26:49',1),(27,2,6,'1e98db8cd5cfcdb5ba3936ee2fd26ce1','2025-11-10 17:32:16','2025-11-10 17:37:16',1);
/*!40000 ALTER TABLE `nonces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `classroom` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'123','123','$2b$10$slnMGLiKmaNRUsYONb5hpe/Wcdf2V4xf/AUxV9SV7zdp/XBMnADFW','3','A','2025-10-28 18:23:24'),(2,'56','56','$2b$10$jqznfIrFvvP3DpFH1pQRX.GdBwwz5U3/8hZi/3uxQdzHhS6K3Kb0G','3','B','2025-10-28 18:28:08'),(3,'456','456','$2b$10$ga3iogQJQIzPUzGnZK8ZtuvlFxy5I/0KYAsyse1nINXFQGwJ3OtKG',NULL,NULL,'2025-10-31 11:50:38');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'teacher1','王老師','password1','2025-10-28 18:47:54'),(2,'teacher2','李老師','password2','2025-10-28 18:47:54'),(3,'teacher3','陳老師','password3','2025-10-28 18:47:54'),(4,'teacher4','林老師','password4','2025-10-28 18:47:54'),(5,'teacher5','吳老師','password5','2025-10-28 18:47:54');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10 18:47:40
