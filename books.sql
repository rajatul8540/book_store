-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 23, 2026 at 07:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `store`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `published_date` date DEFAULT NULL,
  `_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `cover_image`, `price`, `published_date`, `_deleted`, `created_at`, `updated_at`) VALUES
(1, 'Add Book', 'Add Book', 'books/bIyC7z24RsAiR3IEz0dxMAQn8ePwZ2RYIilzWP88.png', 1.00, '2026-05-22', 1, '2026-05-23 01:27:06', '2026-05-23 01:31:37'),
(2, 'ATUL', 'ramu', 'books/8PTFkqCJyieZOlpy3J0jjs0OVqmG0bJktpNuFTvY.png', 1221.00, '2026-05-23', 0, '2026-05-23 01:32:03', '2026-05-23 01:32:03'),
(3, 'sd', 'sd', 'books/ohxoLjP7nd9KqYh5pYZBiSySz5Uh0O8L0rkxSRyH.png', 10.99, '2026-05-29', 0, '2026-05-23 01:34:01', '2026-05-23 01:34:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `books__deleted_title_index` (`_deleted`,`title`),
  ADD KEY `books__deleted_author_index` (`_deleted`,`author`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
