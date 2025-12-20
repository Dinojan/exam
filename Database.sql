-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 20, 2025 at 12:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `exam`
--

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` int(11) NOT NULL,
  `registration_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `url` text NOT NULL,
  `is_registered` tinyint(1) NOT NULL DEFAULT 1,
  `answers` text NOT NULL DEFAULT '[]',
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `status` enum('not_started','started','in_progress','completed','abandoned','rules_violation') DEFAULT 'not_started',
  `time_remaining` varchar(11) DEFAULT NULL,
  `score` decimal(10,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_attempts`
--

INSERT INTO `exam_attempts` (`id`, `registration_id`, `student_id`, `exam_id`, `url`, `is_registered`, `answers`, `started_at`, `completed_at`, `status`, `time_remaining`, `score`, `percentage`, `passed`, `created_at`, `updated_at`) VALUES
(1, 1, 15, 1, '2315378ed4e6dbbb7a3e11d70b4838a74fcb27e30abfb6033e078686bbdd3e569a8b6956cddf1d03b453600ef61bf46c617712c888d5cc65fdb4c140799ff940e8e8a0770b9070a8cc5b6e5c02eace1d6b6382e2d1c2c106f7bb', 1, '[{\"question_id\":\"16\",\"answer\":\"A\",\"flagged\":\"false\"},{\"question_id\":\"8\",\"answer\":\"B\",\"flagged\":\"false\"},{\"question_id\":\"4\",\"answer\":\"D\",\"flagged\":\"false\"},{\"question_id\":\"9\",\"answer\":\"C\",\"flagged\":\"false\"},{\"question_id\":\"2\",\"answer\":\"C\",\"flagged\":\"false\"}]', '2025-12-16 14:42:00', '2025-12-16 15:43:19', 'rules_violation', '00:58:44', 3.00, 3.00, 0, '2025-12-13 07:12:40', '2025-12-16 10:13:19'),
(2, 2, 15, 11, '0458e1bc6ef679f3ac0e0577c3abd3679bf2dac10683db9bdc8298c2f02d9a8b7d4da08c5954394f278750c360d2ddbf1182498a7ef300c1a0a243ded4e55fb47adf0668f56ce964093cfdd5bab375e3c7801c1975d3e7a30c49', 1, '[{\"question_id\":\"2\",\"answer\":\"D\",\"flagged\":\"false\"},{\"question_id\":\"1\",\"answer\":\"B\",\"flagged\":\"true\"},{\"question_id\":\"8\",\"answer\":\"B\",\"flagged\":\"true\"},{\"question_id\":\"4\",\"answer\":\"B\",\"flagged\":\"false\"},{\"question_id\":\"3\",\"answer\":\"D\",\"flagged\":\"false\"}]', '2025-12-20 13:36:12', '2025-12-20 13:37:09', 'rules_violation', '01:59:37', 4.00, 4.00, 0, '2025-12-13 10:28:16', '2025-12-20 08:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `exam_info`
--

CREATE TABLE `exam_info` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `code` varchar(250) NOT NULL,
  `duration` decimal(25,2) NOT NULL DEFAULT 0.00,
  `total_num_of_ques` int(4) NOT NULL,
  `total_marks` int(4) NOT NULL DEFAULT 0,
  `passing_marks` int(4) NOT NULL DEFAULT 0,
  `instructions` text DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT 0,
  `course` int(11) DEFAULT NULL,
  `module` int(11) DEFAULT NULL,
  `batch` year(4) DEFAULT NULL,
  `semi` int(2) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `published_by` int(11) NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_info`
--

INSERT INTO `exam_info` (`id`, `title`, `code`, `duration`, `total_num_of_ques`, `total_marks`, `passing_marks`, `instructions`, `status`, `course`, `module`, `batch`, `semi`, `created_by`, `published_by`, `published_at`, `created_at`) VALUES
(1, 'test 1', 'test 1', 120.00, 13, 100, 40, '', 1, NULL, NULL, NULL, 0, 1, 1, '2025-12-11 00:00:00', '2025-11-25 05:45:41'),
(11, '2nd Semi Math Exam', 'MATH_2025_SEMI_2', 120.00, 5, 100, 40, '', 1, NULL, NULL, NULL, 0, 1, 1, '2025-12-11 00:00:00', '2025-12-11 05:01:46'),
(20, '2nd Semi Math Exam', 'MATH_2025_SEMI_2', 120.00, 5, 100, 40, '', 0, NULL, NULL, NULL, 0, 1, 1, '2025-12-11 00:00:00', '2025-12-11 05:01:46');

-- --------------------------------------------------------

--
-- Table structure for table `exam_registration`
--

CREATE TABLE `exam_registration` (
  `id` int(11) NOT NULL,
  `reg_no` varchar(25) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('registered','in_progress','completed','canceled') DEFAULT 'registered',
  `preferred_language` varchar(10) DEFAULT 'en',
  `special_accommodations` text DEFAULT NULL,
  `receive_notifications` tinyint(1) DEFAULT 0,
  `terms_accepted` tinyint(1) DEFAULT 0,
  `attempts_count` int(11) DEFAULT 0,
  `last_attempt_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_registration`
--

INSERT INTO `exam_registration` (`id`, `reg_no`, `exam_id`, `student_id`, `registration_date`, `status`, `preferred_language`, `special_accommodations`, `receive_notifications`, `terms_accepted`, `attempts_count`, `last_attempt_date`, `created_at`, `updated_at`) VALUES
(1, 'EX_REG_0001', 1, 15, '2025-12-13 12:42:40', 'completed', 'en', NULL, 0, 1, 1, '2025-12-16 14:42:00', '2025-12-13 07:12:40', '2025-12-20 04:07:27'),
(2, 'EX_REG_0002', 11, 15, '2025-12-13 15:58:16', 'completed', 'en', NULL, 0, 1, 1, '2025-12-20 13:36:12', '2025-12-13 10:28:16', '2025-12-20 08:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `exam_settings`
--

CREATE TABLE `exam_settings` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `schedule_type` varchar(255) NOT NULL DEFAULT 'scheduled',
  `start_time` datetime DEFAULT NULL,
  `shuffle_questions` tinyint(1) DEFAULT 0,
  `shuffle_options` tinyint(1) DEFAULT 0,
  `immediate_results` tinyint(1) DEFAULT 0,
  `retake` tinyint(1) DEFAULT 0,
  `max_attempts` int(3) DEFAULT 1,
  `enable_proctoring` tinyint(1) DEFAULT 0,
  `full_screen_mode` tinyint(1) DEFAULT 0,
  `disable_copy_paste` tinyint(1) DEFAULT 0,
  `disable_right_click` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_settings`
--

INSERT INTO `exam_settings` (`id`, `exam_id`, `schedule_type`, `start_time`, `shuffle_questions`, `shuffle_options`, `immediate_results`, `retake`, `max_attempts`, `enable_proctoring`, `full_screen_mode`, `disable_copy_paste`, `disable_right_click`, `created_at`, `updated_at`) VALUES
(1, 1, 'scheduled', '2025-12-16 14:42:00', 1, 1, 0, 1, 1, 1, 1, 1, 1, '2025-12-05 09:57:53', '2025-12-16 10:12:21'),
(13, 11, 'anytime', NULL, 1, 1, 0, 1, 2, 0, 1, 1, 1, '2025-12-11 05:47:19', '2025-12-15 08:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `exam_ids` text DEFAULT NULL,
  `section_ids` text DEFAULT NULL,
  `question` text NOT NULL,
  `q_img` text DEFAULT NULL,
  `marks` decimal(25,2) NOT NULL,
  `answer` varchar(10) NOT NULL,
  `a` text DEFAULT NULL,
  `b` text DEFAULT NULL,
  `c` text DEFAULT NULL,
  `d` text DEFAULT NULL,
  `a_img` text DEFAULT NULL,
  `b_img` text DEFAULT NULL,
  `c_img` text DEFAULT NULL,
  `d_img` text DEFAULT NULL,
  `grid` int(2) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `exam_ids`, `section_ids`, `question`, `q_img`, `marks`, `answer`, `a`, `b`, `c`, `d`, `a_img`, `b_img`, `c_img`, `d_img`, `grid`, `created_by`, `created_at`) VALUES
(1, '[\"1\", \"11\"]', '[\"6\", \"31\"]', 'Test Question 1', NULL, 2.00, 'B', 'Option A', 'Option B', 'Option C', 'Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-11-25 10:03:52'),
(2, '[\"1\", \"11\"]', NULL, 'Test Question 2', NULL, 2.00, 'B', 'Option A', 'Option B', 'Option C', 'Option D', NULL, NULL, NULL, NULL, 1, 1, '2025-11-25 10:07:39'),
(3, '[\"1\", \"11\"]', '[\"6\", \"31\"]', 'Test Question 3', NULL, 2.00, 'B', 'Option A', 'Option B', 'Option C', 'Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-11-25 10:08:30'),
(4, '[\"1\", \"11\"]', NULL, 'Test Question 4', NULL, 2.00, 'B', 'Option A', 'Option B', 'Option C', 'Option D', NULL, NULL, NULL, NULL, 1, 1, '2025-11-25 10:11:21'),
(8, '[\"1\", \"11\"]', '[\"6\"]', 'Test Question 5', NULL, 2.00, 'A', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 05:17:01'),
(9, '[\"1\"]', '[\"6\"]', 'Test Question 6', NULL, 2.00, 'C', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 06:32:58'),
(10, '[\"1\"]', '[\"6\"]', 'Test Question 7', NULL, 2.00, 'C', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 06:34:21'),
(11, '[\"1\"]', NULL, 'Test Question 8', NULL, 1.00, 'C', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 07:01:26'),
(12, '[\"1\"]', NULL, 'Test Question 9', NULL, 1.00, 'B', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 07:05:28'),
(13, '[\"1\"]', NULL, 'Test Question 10', NULL, 1.00, 'A', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 07:07:14'),
(14, '[\"1\"]', '[\"29\"]', 'Test Question 10', NULL, 1.00, 'C', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 07:11:20'),
(15, '[\"1\"]', '[\"29\"]', 'Test Question 11', NULL, 1.00, 'B', 'Test Option A', 'Test Option B', 'Test Option C', 'Test Option D', NULL, NULL, NULL, NULL, 2, 1, '2025-12-02 07:21:47'),
(16, '[\"1\"]', NULL, 'fwsefew', NULL, 1.00, 'A', 'sdfdsf', 'sdfsd', 'sdfsd', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:26:41'),
(17, '', NULL, 'dasdsad', NULL, 1.00, 'A', 'asdas', 'asdas', 'asdas', 'asdas', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:27:48'),
(18, NULL, NULL, 'sdfsdfds', NULL, 1.00, 'A', 'dsfsdf', 'sdfsd', 'sdfds', 'dsfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:28:12'),
(19, NULL, NULL, 'fdsadsa', NULL, 1.00, 'B', 'dasdsa', 'asdasas', 'asdas', 'asd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:28:53'),
(20, NULL, NULL, 'fsdfs', NULL, 1.00, 'B', 'sdfs', 'sdfsd', 'fdsfsd', 'dsfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:33:33'),
(21, NULL, NULL, 'hgfhf', NULL, 1.00, 'B', 'gfdgfd', 'dfgdfg', 'dfgfd', 'dfgfdg', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:34:30'),
(22, NULL, NULL, 'dsfdsf', NULL, 1.00, 'C', 'sdfsd', 'dsfdsfds', 'dsfsd', 'sdfsdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:37:49'),
(23, NULL, NULL, 'gfdggfd', NULL, 1.00, 'B', 'hgfdgf', 'gdfg', 'dfgdf', 'fdgdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 07:38:22'),
(24, NULL, NULL, 'hgjghj', NULL, 1.00, 'C', 'hgjhg', 'jhghg', 'ghjhg', 'ghjgh', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 08:16:58'),
(25, NULL, NULL, 'XZCFDF', NULL, 1.00, 'B', 'sfdgfds', 'gfdgfd', 'dfgfd', 'dfgd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 08:17:47'),
(26, NULL, NULL, 'hgjhgj', NULL, 1.00, 'B', 'hgjhg', 'ghjgh', 'ghjg', 'hgjgh', NULL, NULL, NULL, NULL, 1, 1, '2025-12-02 08:18:02'),
(27, NULL, NULL, 'gdfgf', NULL, 1.00, 'C', 'gdfgfd', 'dfgdf', 'dfgdfg', 'dfgdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 03:51:20'),
(28, NULL, NULL, 'dgfdg', NULL, 1.00, 'A', 'dfgfd', 'fdgdf', 'dfgdf', 'dfgfdg', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 03:59:32'),
(29, NULL, NULL, 'ddas', NULL, 1.00, 'B', 'dassa', 'asdsa', 'asdsad', 'asdsad', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:06:43'),
(30, NULL, NULL, 'fdsgdsf', NULL, 1.00, 'A', 'sdfsd', 'sdfsd', 'sdfds', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:07:34'),
(31, NULL, NULL, 'fdsfdfsd', NULL, 1.00, 'A', 'sdfsd', 'sdfds', 'sdfsdf', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:08:18'),
(32, NULL, NULL, 'rerf', NULL, 1.00, 'A', 'dsfsd', 'sdfs', 'sdfd', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:10:14'),
(33, NULL, NULL, 'fdsfsdf', NULL, 1.00, 'A', 'sdfsd', 'sdfsd', 'sdfsd', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:11:19'),
(34, NULL, NULL, 'fdsfdsf', NULL, 1.00, 'A', 'sdfsd', 'sdfsd', 'sdfds', 'sdfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:12:10'),
(35, NULL, NULL, 'dsadsads', NULL, 1.00, 'B', 'asdsa', 'sadsa', 'sadas', 'sadasd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:27:30'),
(36, NULL, NULL, 'yretre', NULL, 1.00, 'B', 'tret', 'ertre', 'rter', 'ertre', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 06:35:15'),
(37, NULL, NULL, 'ffsdf', NULL, 1.00, 'A', 'sdfsd', 'sdfds', 'sdfsd', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 07:48:30'),
(38, NULL, NULL, 'fsdfsd', NULL, 1.00, 'C', 'sdfsd', 'sdfsd', 'fdsd', 'sdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:02:16'),
(39, NULL, NULL, 'hhfg', NULL, 1.00, 'C', 'fhgf', 'fghfg', 'hfg', 'fghf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:12:14'),
(40, NULL, NULL, 'gfdgfd', NULL, 1.00, 'C', 'fdgfd', 'gfdgfd', 'fdgfd', 'dfgfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:19:59'),
(41, NULL, NULL, 'gdfg', NULL, 1.00, 'C', 'gdfg', 'fdg', 'gd', 'gfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:21:13'),
(42, NULL, NULL, 'dfsdds', NULL, 1.00, 'A', 'sdf', 'sdfds', 'dsfsd', 'sdfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:24:04'),
(43, NULL, NULL, 'fdsfdsf', NULL, 1.00, 'B', 'sdfsd', 'dsf', 'sdf', 'sdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:27:59'),
(44, NULL, NULL, 'dfds', NULL, 1.00, 'B', 'dsfds', 'sdfsd', 'dsfsd', 'dsfds', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:29:00'),
(45, NULL, NULL, 'bdfgf', NULL, 1.00, 'D', 'fdgfd', 'fdgfd', 'fgfd', 'dfgfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:30:23'),
(46, NULL, NULL, 'bcvb', NULL, 1.00, 'B', 'dghdfg', 'nvb', 'sdf', 'vbcb', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:31:47'),
(47, NULL, NULL, 'bcvb', NULL, 1.00, 'B', 'dghdfg', 'nvb', 'sdf', 'vbcb', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:31:47'),
(48, NULL, NULL, 'fgsdd', NULL, 1.00, 'A', 'dfsd', 'sdfsd', 'dfsd', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:32:34'),
(49, NULL, NULL, 'fsdfd', NULL, 1.00, 'A', 'fds', 'sdfds', 'dsfds', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 09:33:30'),
(50, NULL, NULL, 'asdsa', NULL, 1.00, 'B', 'dsas', 'asdsa', 'sdsa', 'sadsa', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 10:21:38'),
(51, NULL, NULL, 'gdfg', NULL, 1.00, 'C', 'fdgdf', 'gdf', 'fdgfd', 'dfgfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 10:25:39'),
(52, NULL, NULL, 'gfdgfd', NULL, 1.00, 'B', 'gfdgfd', 'fdgfd', 'dfgdf', 'dfgdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 10:38:23'),
(53, NULL, NULL, 'fsdfsd', NULL, 1.00, 'B', 'fsdf', 'sfds', 'sdfs', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 11:27:40'),
(54, NULL, NULL, 'csdfsd', NULL, 1.00, 'A', 'sdfds', 'sdfsd', 'fsdf', 'dsfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 11:31:40'),
(55, NULL, NULL, 'gfdgfgfd', NULL, 1.00, 'A', 'gdfg', 'gdfg', 'dfgdf', 'gdfg', NULL, NULL, NULL, NULL, 1, 1, '2025-12-03 11:44:24'),
(56, NULL, NULL, 'gfd', NULL, 1.00, 'C', 'gfdg', 'fdgfd', 'dfgfdgfd', 'gfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-05 04:30:15'),
(57, NULL, NULL, 'dfgfd', NULL, 1.00, 'B', 'fdgfd', 'fgdfd', 'fdgfd', 'gfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-05 04:30:31'),
(58, NULL, NULL, 'gfdgfd', NULL, 1.00, 'A', 'dfgfd', 'gdfd', 'dfg', 'fdg', NULL, NULL, NULL, NULL, 1, 1, '2025-12-05 06:55:27'),
(59, NULL, NULL, 'gfd', NULL, 1.00, 'A', 'fdg', 'fdgfd', 'dfg', 'gfd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-05 06:55:50'),
(60, NULL, NULL, 'fsdfdsd', NULL, 1.00, 'B', 'fsdf', 'sdfds', 'fsdf', 'sdfsd', NULL, NULL, NULL, NULL, 1, 1, '2025-12-11 05:08:57'),
(61, NULL, NULL, 'sdfdf', NULL, 1.00, 'B', 'dsfsd', 'dfds', 'sdf', 'sdf', NULL, NULL, NULL, NULL, 4, 1, '2025-12-11 05:11:34'),
(62, NULL, NULL, 'fsdfds', NULL, 1.00, 'A', 'fdsf', 'sdf', 'sdf', 'sdf', NULL, NULL, NULL, NULL, 2, 1, '2025-12-11 05:35:00'),
(63, NULL, NULL, 'fsdf', NULL, 1.00, 'A', 'fdsf', 'sdf', 'sdf', 'sdf', NULL, NULL, NULL, NULL, 1, 1, '2025-12-11 05:35:02'),
(64, NULL, NULL, 'gfdg', NULL, 1.00, 'A', 'dfg', 'dfg', 'fdg', 'dfg', NULL, NULL, NULL, NULL, 4, 1, '2025-12-11 05:35:22');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `s_des` text DEFAULT NULL,
  `s_s_des` text DEFAULT NULL,
  `num_of_ques` int(3) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `exam_id`, `title`, `s_des`, `s_s_des`, `num_of_ques`, `created_by`, `created_at`) VALUES
(6, 1, 'Section 1', NULL, NULL, 5, 1, '2025-12-02 11:18:48'),
(29, 1, 'Section 2', 'Test Description', 'Test Second Description', 2, 1, '2025-12-03 11:38:41'),
(31, 11, 'Section 3', 'Test Description', '', 2, 1, '2025-12-13 10:22:22');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `reg_no` varchar(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` int(16) NOT NULL,
  `username` varchar(255) NOT NULL,
  `user_group` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `reg_no`, `name`, `phone`, `username`, `user_group`, `email`, `password`, `note`, `status`, `created_at`, `updated_at`) VALUES
(1, '', 'Technical', 769104866, 'Technical', 1, 'nit@nit.lk', '$2y$10$yxmxgdwkKx./JeouE7440eWhyEmHwyKtA2gLGFnTBeO0WBluD316K', NULL, 0, '2025-11-10 04:35:12', '2025-12-12 11:23:44'),
(2, '', 'Super Admin', 770000000, 'Super Admin', 2, 'sadmin@gmail.com', '$2y$10$XSHpkVodlQWIK1dcqwoxaecQvH/1FLq5KFSiaMnL8hS2DXdI1WeBm', NULL, 0, '2025-11-10 04:35:12', '2025-12-12 11:23:44'),
(3, '', 'Admin', 770000001, 'Admin', 3, 'admin@gmail.com', '$2y$10$IlvEIF9FHbKO4idOCYAie.NFQkokCRylyChihPeVr5..PGfMGYhbC', NULL, 0, '2025-11-11 05:15:21', '2025-12-12 11:23:44'),
(4, '', 'HOD', 770000002, 'HOD', 4, 'hod@gmail.com', '$2y$10$comQ2IKtK4Mzyu8X8kg74.N17/9WGXbZcSqcDrT0ks8dDXBDUO6Xi', NULL, 0, '2025-11-11 05:15:52', '2025-12-12 11:23:44'),
(5, '', 'Lecturer', 770000003, 'Lecturer', 5, 'lecturer@gmail.com', '$2y$10$kPn8ypKFeiBb.NySZKiqJubY1QXp0/x6pALTVONOZTKVuGcRTz0QK', NULL, 0, '2025-11-11 05:15:52', '2025-12-12 11:23:44'),
(6, '', 'Student', 770000004, 'Student', 6, 'student@gmail.com', '$2y$10$YkAfCZplNZIapz2F5HWz.ud71q59USbBUmZn2Yc8PPP4.zTXwRIJC', NULL, 0, '2025-11-11 05:15:52', '2025-12-12 11:23:44'),
(7, '', 'Parent', 770000005, 'Parent', 7, 'parent@gmail.com', '$2y$10$QifOmKW/FcDWPEH61qZhNu8ma5ApURI8.HOyogFknfq3MnZkg79G2', NULL, 0, '2025-11-11 05:15:52', '2025-12-12 11:23:44'),
(8, '', 'Saththiyaseelan Keyithan', 772114093, 'keyithan', 6, 'sathyjaseelankeyithan@gamil.com', '$2y$10$kDXnewF3PdrTtHkA/t0cX.w.xqTpFtqBqBj7cpFtiWdx16Mo7xTeq', '', 0, '2025-12-12 11:25:50', '2025-12-13 03:43:49'),
(11, '', 'Saththiyaseelan Keyithan', 772114093, 'Keyithanb', 6, 'saththiyaseelankeyithan@gamil.com', '$2y$10$k4pxrO7HLIrE8ncvhopGz.3Qz0uxjQKu6883494QdKjmlm4xiNfEC', '', 0, '2025-12-12 11:35:28', '2025-12-13 03:43:53'),
(12, '', 'Saththiyaseelan Keyithan', 772114093, 'keyi', 6, 'sathyseelankeyithan@gamil.com', '$2y$10$76n.80qqYVRczqJPoza3buVSrtz4TVsFfzlnAMf8mSKv3Y1EX0Tpu', '', 0, '2025-12-12 11:36:20', '2025-12-13 03:43:56'),
(13, NULL, 'Saththiyaseelan Keyithan', 77211493, 'nitexist', 6, 'tech@nit.lk', '$2y$10$NVJKzuytRBbNKh8vqrJFyuRCVf.Zt2jZzccfuFdw0hYk7A6g3b7HC', '', 0, '2025-12-13 03:58:20', '2025-12-13 04:01:21'),
(14, NULL, 'Saththiyaseelan Keyithan', 77211493, 'Keyith', 1, 'nit@tech.lk', '$2y$10$fuMjI2WHPRBjFwgYo6ubPO.SdRT9FLX8r.TyiaL28GsdpiVAWuUm6', '', 0, '2025-12-13 05:05:38', '2025-12-13 05:05:38'),
(15, 'STU1001', 'Saththiyaseelan Keyithan', 7622918, 'Tech', 6, 'sadmin@nit.com', '$2y$10$vPb0aSK3qdldVDSbKC1h6eKnGzue7iGKMvUi/dkgsJSc2jTt49f56', '', 0, '2025-12-13 05:09:28', '2025-12-13 05:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `user_group`
--

CREATE TABLE `user_group` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `permission` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_group`
--

INSERT INTO `user_group` (`id`, `name`, `permission`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Technical', '[\'exams.create\',\'exams.delete\',\'exams.edit\',\'exams.view\',\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.manage\',\'courses.view\',\'courses.create\',\'courses.edit\',\'courses.delete\',\'courses.assign\',\'courses.unassign\',\'exams.all\',\'exams.manage\',\'exams.schedule\',\'questions.create\',\'questions.view\',\'questions.edit\',\'questions.delete\',\'questions.bank\',\'questions.all\',\'questions.assign\',\'past_papers.view\',\'past_papers.upload\',\'past_papers.edit\',\'past_papers.delete\',\'past_papers.all\',\'results.view\',\'results.publish\',\'results.all\',\'rerults.edit\',\'results.delete\',\'results.create\',\'results.manage\',\'attendance.manage\',\'attendance.view\',\'attendance.mark\',\'attendance.all\',\'attendance.change\',\'attendance.delete\',\'attendance.edit\',\'attendance.create\',\'notifications.view\',\'notifications.send\',\'notifications.manage\',\'notifications.all\',\'notifications.templates\',\'notifications.settings\',\'users.manage\',\'users.create\',\'users.edit\',\'users.delete\',\'users.view\',\'students.manage\',\'lecturers.manage\',\'parents.manage\',\'groups.manage\',\'students.create\',\'students.edit\',\'students.delete\',\'students.view\',\'students.link\',\'students.link.classes\',\'students.link.subjects\',\'students.link.parents\',\'students.link.guardians\',\'students.link.attendance\',\'students.link.exams\',\'students.link.results\',\'students.link.behaviour\',\'students.link.medical\',\'students.link.documents\',\'students.link.transport\',\'students.link.fee\',\'parents.create\',\'parents.edit\',\'parents.delete\',\'parents.view\',\'parents.link\',\'parents.link.students\',\'parents.link.documents\',\'lecturers.create\',\'lecturers.edit\',\'lecturers.delete\',\'lecturers.view\',\'lecturers.link.courses\',\'lecturers.link.classes\',\'lecturers.link.departments\',\'lecturers.link.lectures\',\'departments.manage\',\'departments.view\',\'departments.create\',\'departments.edit\',\'departments.delete\',\'departments.link\',\'departments.link.courses\',\'departments.link.lecturers\',\'departments.link.students\',\'departments.link.staff\',\'departments.link.reports\',\'departments.link.branch\',\'reports.view\',\'reports.create\',\'reports.edit\',\'reports.delete\',\'reports.download\',\'reports.exam\',\'reports.exam.create\',\'reports.eaxm.edit\',\'reports.eaxm.delete\',\'reports.eaxm.view\',\'reports.eaxm.download\',\'reports.fee\',\'reports.attendance\',\'reports.behaviour\',\'reports.academic\',\'reports.performance\',\'profile.view\',\'profile.edit\',\'profile.change_password\',\'profile.delete\',\'settings.manage\',\'settings.advanced\',\'hod.view\',\'hod.create\',\'hod.edit\',\'hod.delete\',\'hod.link.departments\',\'hod.manage\',\'notifications.my\',\'courses.my_courses\',\'exams.attempt\',\'exams.my\',\'questions.my\',\'questions.delete.my\',\'questions.edit.my\',\'past_papers.my\',\'results.my\',\'attendance.my\',\'hod.my\',\'lecturers.view.my\',\'reports.edit.my\',\'reports.view.my\',\'reports.delete.my\',\'reports.eaxm.edit.my\',\'reports.eaxm.delete.my\',\'reports.eaxm.view.y\',\'profile.delete.my\',\'reports..my\',\'reports.attendance.my\',\'reports.behaviour.my\',\'reports.academic.my\',\'reports.performance.my\',\'reports.download.my\',\'reports.eaxm.download.my\',\'reports.eaxm.view.my\',\'reports.fee.my\']', NULL, 1, '2025-11-10 04:35:12', '2025-11-17 09:54:05'),
(2, 'Administrator', '[\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.manage\',\'courses.view\',\'courses.create\',\'courses.edit\',\'courses.delete\',\'exams.schedule\',\'exams.all\',\'exams.view\',\'questions.view\',\'questions.bank\',\'questions.all\',\'past_papers.view\',\'past_papers.upload\',\'past_papers.all\',\'results.view\',\'results.publish\',\'attendance.view\',\'attendance.all\',\'attendance.create\',\'notifications.view\',\'notifications.send\',\'notifications.manage\',\'notifications.all\',\'notifications.templates\',\'notifications.settings\',\'users.manage\',\'users.create\',\'users.edit\',\'users.delete\',\'users.view\',\'lecturers.manage\',\'hod.manage\',\'groups.manage\',\'students.view\',\'students.link.medical\',\'students.link.results\',\'students.link.exams\',\'students.link.guardians\',\'students.link.subjects\',\'students.link.parents\',\'students.link.attendance\',\'students.link.behaviour\',\'students.link.documents\',\'students.link.transport\',\'students.link.fee\',\'students.link\',\'parents.view\',\'parents.edit\',\'parents.delete\',\'parents.link\',\'parents.link.students\',\'parents.link.documents\',\'lecturers.create\',\'lecturers.edit\',\'lecturers.delete\',\'lecturers.view\',\'lecturers.link.courses\',\'lecturers.link.classes\',\'lecturers.link.departments\',\'departments.manage\',\'departments.view\',\'departments.create\',\'departments.edit\',\'departments.delete\',\'departments.link\',\'departments.link.courses\',\'departments.link.lecturers\',\'departments.link.staff\',\'departments.link.reports\',\'departments.link.branch\',\'hod.view\',\'hod.create\',\'hod.edit\',\'hod.delete\',\'hod.link.departments\',\'reports.view\',\'reports.edit\',\'reports.download\',\'reports.exam\',\'reports.eaxm.view\',\'reports.eaxm.download\',\'reports.fee\',\'reports.attendance\',\'reports.behaviour\',\'reports.performance\',\'reports.academic\',\'profile.view\',\'profile.edit\',\'profile.delete\',\'profile.change_password\',\'settings.manage\',\'courses.assign\',\'courses.unassign\',\'notifications.my\',\'reports.create\',\'reports.delete\']', NULL, 1, '2025-11-10 04:35:12', '2025-11-17 09:23:06'),
(3, 'Admin', '[\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.manage\',\'courses.view\',\'courses.create\',\'courses.edit\',\'courses.delete\',\'courses.assign\',\'courses.unassign\',\'exams.view\',\'exams.all\',\'exams.schedule\',\'questions.view\',\'questions.bank\',\'questions.all\',\'past_papers.view\',\'past_papers.upload\',\'past_papers.all\',\'past_papers.edit\',\'results.view\',\'results.publish\',\'results.all\',\'results.manage\',\'attendance.view\',\'attendance.all\',\'attendance.create\',\'notifications.view\',\'notifications.send\',\'notifications.manage\',\'notifications.all\',\'notifications.templates\',\'notifications.settings\',\'users.manage\',\'users.create\',\'users.edit\',\'users.delete\',\'users.view\',\'students.manage\',\'lecturers.manage\',\'parents.manage\',\'hod.manage\',\'students.create\',\'students.edit\',\'students.delete\',\'students.view\',\'students.link\',\'students.link.classes\',\'students.link.parents\',\'students.link.guardians\',\'students.link.attendance\',\'students.link.exams\',\'students.link.results\',\'students.link.behaviour\',\'students.link.medical\',\'students.link.documents\',\'students.link.transport\',\'students.link.fee\',\'parents.create\',\'parents.edit\',\'parents.delete\',\'parents.view\',\'parents.link\',\'parents.link.students\',\'parents.link.documents\',\'lecturers.create\',\'lecturers.edit\',\'lecturers.delete\',\'lecturers.view\',\'lecturers.link.courses\',\'lecturers.link.classes\',\'lecturers.link.departments\',\'lecturers.link.lectures\',\'departments.manage\',\'departments.view\',\'departments.create\',\'departments.edit\',\'departments.delete\',\'departments.link\',\'departments.link.courses\',\'departments.link.lecturers\',\'departments.link.students\',\'departments.link.staff\',\'departments.link.reports\',\'departments.link.branch\',\'hod.view\',\'hod.create\',\'hod.edit\',\'hod.delete\',\'hod.link.departments\',\'reports.view\',\'reports.create\',\'reports.edit\',\'reports.delete\',\'reports.download\',\'reports.exam\',\'reports.exam.create\',\'reports.eaxm.edit\',\'reports.eaxm.delete\',\'reports.eaxm.view\',\'reports.eaxm.download\',\'reports.fee\',\'reports.attendance\',\'reports.behaviour\',\'reports.academic\',\'reports.performance\',\'profile.view\',\'profile.edit\',\'profile.change_password\',\'profile.delete\',\'settings.manage\',\'notifications.my\']', NULL, 1, '2025-11-10 10:24:07', '2025-11-17 09:25:00'),
(4, 'HOD', '[\'dashboard.view\',\'dashboard.reports\',\'dashboard.notifications\',\'dashboard.analytics\',\'courses.view\',\'courses.assign\',\'courses.unassign\',\'exams.all\',\'exams.schedule\',\'questions.create\',\'questions.view\',\'questions.bank\',\'questions.assign\',\'past_papers.view\',\'past_papers.upload\',\'past_papers.edit\',\'results.view\',\'results.publish\',\'results.all\',\'rerults.edit\',\'results.create\',\'results.manage\',\'attendance.view\',\'attendance.all\',\'attendance.create\',\'notifications.view\',\'notifications.send\',\'lecturers.view\',\'departments.view\',\'hod.view\',\'reports.view\',\'reports.create\',\'reports.download\',\'reports.exam\',\'reports.exam.create\',\'reports.eaxm.edit\',\'reports.eaxm.view\',\'reports.eaxm.download\',\'reports.fee\',\'reports.attendance\',\'reports.behaviour\',\'reports.academic\',\'reports.performance\',\'profile.view\',\'profile.edit\',\'profile.change_password\',\'lecturers.link.departments\',\'questions.edit.my\',\'questions.delete.my\',\'questions.my\',\'notifications.my\',\'lecturers.link.courses\',\'lecturers.link.classes\',\'lecturers.view.my\',\'lecturers.link.lectures\',\'reports.view.my\',\'reports.edit.my\',\'reports.delete.my\',\'reports.eaxm.edit.my\',\'reports.eaxm.delete.my\',\'reports.eaxm.view.y\',\'profile.delete.my\',\'reports.download.my\',\'reports.eaxm.view.my\',\'reports.eaxm.download.my\']', NULL, 1, '2025-11-10 10:24:07', '2025-11-17 09:53:49'),
(5, 'Lecturer', '[\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.view\',\'courses.my_courses\',\'exams.create\',\'exams.edit\',\'exams.view\',\'exams.all\',\'exams.manage\',\'exams.my\',\'exams.schedule\',\'questions.create\',\'questions.view\',\'questions.bank\',\'questions.my\',\'questions.assign\',\'questions.delete.my\',\'questions.edit.my\',\'past_papers.view\',\'past_papers.my\',\'past_papers.upload\',\'results.view\',\'results.all\',\'rerults.edit\',\'results.create\',\'results.manage\',\'attendance.manage\',\'attendance.mark\',\'attendance.change\',\'attendance.edit\',\'attendance.create\',\'notifications.view\',\'notifications.send\',\'notifications.my\',\'attendance.view\',\'students.create\',\'students.edit\',\'students.view\',\'students.link.classes\',\'students.link\',\'students.link.subjects\',\'students.link.parents\',\'students.link.guardians\',\'students.link.attendance\',\'students.link.exams\',\'students.link.results\',\'students.link.behaviour\',\'students.link.medical\',\'students.link.transport\',\'students.link.fee\',\'parents.edit\',\'parents.create\',\'parents.view\',\'parents.link.students\',\'lecturers.view\',\'departments.view\',\'hod.view\',\'reports.view\',\'reports.create\',\'lecturers.link.lectures\',\'reports.view.my\',\'reports.edit.my\',\'reports.delete.my\',\'reports.download\',\'reports.exam\',\'reports.exam.create\',\'reports.eaxm.edit.my\',\'reports.eaxm.delete.my\',\'reports.eaxm.view\',\'reports.eaxm.view.y\',\'reports.eaxm.download\',\'reports.fee\',\'reports.attendance\',\'reports.behaviour\',\'reports.academic\',\'reports.performance\',\'profile.view\',\'profile.edit\',\'profile.change_password\',\'profile.delete.my\',\'reports.download.my\',\'reports.eaxm.view.my\',\'reports.eaxm.download.my\']', NULL, 1, '2025-11-10 10:24:07', '2025-11-17 09:53:32'),
(6, 'Student', '[\'exams.view\',\'exams.attempt\',\'past_papers.view\',\'past_papers.my\',\'results.view\',\'results.my\',\'attendance.view\',\'attendance.my\',\'notifications.view\',\'notifications.my\',\'students.view\',\'departments.view\',\'hod.my\',\'reports.view\',\'reports.view.my\',\'reports.eaxm.view.y\',\'profile.view\',\'profile.edit\',\'profile.delete.my\',\'profile.change_password\',\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.view\',\'courses.my_courses\',\'questions.view\',\'lecturers.view\',\'reports..my\',\'reports.attendance.my\',\'reports.behaviour.my\',\'reports.academic.my\',\'reports.performance.my\',\'reports.download.my\',\'reports.eaxm.download.my\',\'reports.fee.my\',\'reports.eaxm.view.my\']', NULL, 1, '2025-11-10 10:24:07', '2025-11-17 09:52:53'),
(7, 'Parent', '[\'dashboard.view\',\'dashboard.reports\',\'dashboard.analytics\',\'dashboard.notifications\',\'courses.view\',\'courses.my_courses\',\'exams.view\',\'questions.view\',\'past_papers.view\',\'past_papers.my\',\'results.view\',\'results.my\',\'attendance.my\',\'notifications.view\',\'notifications.my\',\'parents.view\',\'lecturers.view\',\'departments.view\',\'hod.my\',\'reports.view\',\'reports.view.my\',\'reports.eaxm.view.y\',\'reports..my\',\'reports.attendance.my\',\'reports.behaviour.my\',\'reports.academic.my\',\'reports.performance.my\',\'profile.view\',\'profile.edit\',\'profile.change_password\',\'profile.delete.my\',\'reports.eaxm.download.my\',\'reports.fee.my\',\'reports.download.my\',\'reports.eaxm.view.my\',\'reports.eaxm.view\',\'reports.fee\']', NULL, 1, '2025-11-10 10:24:07', '2025-11-17 09:53:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `exam_info`
--
ALTER TABLE `exam_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_registration`
--
ALTER TABLE `exam_registration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_registration` (`exam_id`,`student_id`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `exam_settings`
--
ALTER TABLE `exam_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_group`
--
ALTER TABLE `user_group`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exam_info`
--
ALTER TABLE `exam_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `exam_registration`
--
ALTER TABLE `exam_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exam_settings`
--
ALTER TABLE `exam_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_group`
--
ALTER TABLE `user_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `exam_registration` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_attempts_ibfk_3` FOREIGN KEY (`exam_id`) REFERENCES `exam_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_registration`
--
ALTER TABLE `exam_registration`
  ADD CONSTRAINT `exam_registration_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exam_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_registration_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
