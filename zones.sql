SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `zones`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `center` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `max_length` int(10) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `cat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;
