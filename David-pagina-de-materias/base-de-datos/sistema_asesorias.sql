-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-10-2026 a las 07:26:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_asesorias`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asesor_materia`
--

CREATE TABLE `asesor_materia` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_materia` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` int(10) UNSIGNED NOT NULL,
  `id_alumno` int(10) UNSIGNED NOT NULL,
  `id_asesor` int(10) UNSIGNED NOT NULL,
  `id_materia` int(10) UNSIGNED NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('Pendiente','Confirmada','Rechazada','Cancelada','Finalizada') NOT NULL DEFAULT 'Pendiente',
  `sala` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidad`
--

CREATE TABLE `disponibilidad` (
  `id_disponibilidad` int(10) UNSIGNED NOT NULL,
  `id_asesor` int(10) UNSIGNED NOT NULL,
  `dia` enum('Lunes','Martes','Miercoles','Jueves','Viernes') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluacion`
--

CREATE TABLE `evaluacion` (
  `id_evaluacion` int(10) UNSIGNED NOT NULL,
  `id_cita` int(10) UNSIGNED NOT NULL,
  `id_evaluador` int(10) UNSIGNED NOT NULL,
  `id_evaluado` int(10) UNSIGNED NOT NULL,
  `tipo_evaluacion` enum('Alumno_a_Asesor','Asesor_a_Alumno') NOT NULL,
  `criterio_1` int(11) NOT NULL,
  `criterio_2` int(11) NOT NULL,
  `promedio_evaluacion` float DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `reporta_incidencia` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia`
--

CREATE TABLE `materia` (
  `id_materia` int(10) UNSIGNED NOT NULL,
  `clave` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `indice_rezago` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materia`
--

INSERT INTO `materia` (`id_materia`, `clave`, `nombre`, `indice_rezago`) VALUES
(1, 'FDS', 'Fundamentos de Desarrollo de Software', NULL),
(2, 'PM-1', 'Pensamiento Matemático I', NULL),
(3, 'LC-1', 'Lengua y Comunicación I', NULL),
(4, 'CD-1', 'Cultura Digital I', NULL),
(5, 'CS-1', 'Ciencias Sociales I', NULL),
(6, 'HUMA-1', 'Humanidades I', NULL),
(7, 'TE-1', 'Temas de Electrónica I', NULL),
(8, 'INGL-1', 'Inglés I', NULL),
(9, 'PE', 'Programación Estructurada', NULL),
(10, 'PM-2', 'Pensamiento Matemático II', NULL),
(11, 'LC-2', 'Lengua y Comunicación II', NULL),
(12, 'CD-2', 'Cultura Digital II', NULL),
(13, 'CS-2', 'Ciencias Sociales II', NULL),
(14, 'CEIM', 'Conservación de la Energía y sus Interacciones con la Materia', NULL),
(15, 'TE-2', 'Temas de Electrónica II', NULL),
(16, 'INGL-2', 'Inglés II', NULL),
(17, 'POO-1', 'Programación Orientada a Objetos I', NULL),
(18, 'IR-1', 'Infraestructura de Redes I', NULL),
(19, 'SD-1', 'Sistemas Digitales I', NULL),
(20, 'TE-3', 'Temas de Electrónica III', NULL),
(21, 'PM-3', 'Pensamiento Matemático III', NULL),
(22, 'LC-3', 'Lengua y Comunicación III', NULL),
(23, 'PFH-2', 'Pensamiento Filosófico y Humanidades II', NULL),
(24, 'CNE-3', 'Ciencias Naturales y Experimentales III', NULL),
(25, 'POO-2', 'Programación Orientada a Objetos II', NULL),
(26, 'IR-2', 'Infraestructura de Redes II', NULL),
(27, 'SD-2', 'Sistemas Digitales II', NULL),
(28, 'TSM-1', 'Temas Selectos de Matemáticas I', NULL),
(29, 'CS-3', 'Ciencias Sociales III', NULL),
(30, 'CH-1', 'Conciencia Histórica I', NULL),
(31, 'RQ', 'Reacciones Químicas', NULL),
(32, 'INGL-4', 'Inglés IV', NULL),
(33, 'MMDS-1', 'Modelos y Métodos de Desarrollo de Software I', NULL),
(34, 'BD-1', 'Base de Datos I', NULL),
(35, 'AOC', 'Arquitectura y Organización de Computadoras', NULL),
(36, 'SO', 'Sistemas Operativos', NULL),
(37, 'TSM-2', 'Temas Selectos de Matemáticas II', NULL),
(38, 'CH-2', 'Conciencia Histórica II', NULL),
(39, 'INGL-5', 'Inglés V', NULL),
(40, 'MMDS-2', 'Modelos y Métodos de Desarrollo de Software II', NULL),
(41, 'BD-2', 'Base de Datos II', NULL),
(42, 'PW-1', 'Programación Web I', NULL),
(43, 'PM-1B', 'Programación Móvil I', NULL),
(44, 'SE-1', 'Sistemas Embebidos I', NULL),
(45, 'PFH-3', 'Pensamiento Filosófico y Humanidades III', NULL),
(46, 'CH-3', 'Conciencia Histórica III', NULL),
(47, 'PI-1', 'Proyecto Integrador I', NULL),
(48, 'PW-2', 'Programación Web II', NULL),
(49, 'PM-2B', 'Programación Móvil II', NULL),
(50, 'SE-2', 'Sistemas Embebidos II', NULL),
(51, 'SCM', 'Sistemas de Control y Medición', NULL),
(52, 'CIBE', 'Ciberseguridad', NULL),
(53, 'PI-2', 'Proyecto Integrador II', NULL),
(54, 'AI', 'Aplicaciones Inteligentes', NULL),
(55, 'PCD', 'Principios de Ciencia de Datos', NULL),
(56, 'PA-2', 'Programación Avanzada II', NULL),
(57, 'FDV', 'Fundamentos de Desarrollo de Videojuegos', NULL),
(58, 'SS', 'Seguridad en Software', NULL),
(59, 'ELEC-1', 'Electrónica I', NULL),
(60, 'METR', 'Metrología', NULL),
(61, 'PF-1', 'Pensamiento Filosófico I', NULL),
(62, 'ELEC-2', 'Electrónica II', NULL),
(63, 'II', 'Instrumentación Industrial', NULL),
(64, 'DAC', 'Dibujo Asistido por Computadora', NULL),
(65, 'CE', 'Conservación de la Energía', NULL),
(66, 'ELEC-3', 'Electrónica III', NULL),
(67, 'LI', 'Laboratorio de Instrumentación', NULL),
(68, 'AUTO', 'Automatización', NULL),
(69, 'HUMA-2', 'Humanidades II', NULL),
(70, 'EI', 'Ecosistemas e Interacciones', NULL),
(71, 'ED', 'Electrónica Digital', NULL),
(72, 'EIB', 'Electricidad Industrial', NULL),
(73, 'EP', 'Electrónica de Potencia', NULL),
(74, 'ME', 'Máquinas Eléctricas', NULL),
(75, 'MECA', 'Mecanismos', NULL),
(76, 'PID', 'Procesamiento de Imágenes Digitales', NULL),
(77, 'ST', 'Sistemas Térmicos', NULL),
(78, 'MICR-1', 'Microcontroladores I', NULL),
(79, 'TC', 'Teoría de Control', NULL),
(80, 'NEUM', 'Neumática', NULL),
(81, 'SM', 'Sistemas Mecatrónicos', NULL),
(82, 'TSM-3', 'Temas Selectos de Matemáticas III', NULL),
(83, 'HUMA-3', 'Humanidades III', NULL),
(84, 'INGL-6', 'Inglés VI', NULL),
(85, 'MICR-2', 'Microcontroladores II', NULL),
(86, 'CLP-1', 'Controladores Lógicos Programables (PLC I)', NULL),
(87, 'LC', 'Laboratorio de Controladores', NULL),
(88, 'RM', 'Robótica Móvil', NULL),
(89, 'IV', 'Instrumentación Virtual', NULL),
(90, 'DSI', 'Domótica y Sistemas Inteligentes', NULL),
(91, 'HIDR', 'Hidráulica', NULL),
(92, 'RI', 'Robótica Industrial', NULL),
(93, 'CP', 'Control de Procesos', NULL),
(94, 'IP', 'Instrumentación de Procesos', NULL),
(95, 'CLP-2', 'Controladores Lógicos Programables II', NULL),
(96, 'RIB', 'Redes Industriales', NULL),
(97, 'LCB', 'Laboratorio de Calibración', NULL),
(98, 'PI', 'Proyecto Integrador', NULL),
(99, 'IC', 'Introducción a la Construcción', NULL),
(100, 'IDC', 'Introducción al Dibujo Constructivo', NULL),
(101, 'MATE', 'Materiales', NULL),
(102, 'MH', 'Maquinaria y Herramientas', NULL),
(103, 'DC', 'Dibujo Constructivo', NULL),
(104, 'PC-1', 'Procedimientos Constructivos I', NULL),
(105, 'PC-2', 'Procedimientos Constructivos II', NULL),
(106, 'DAC-1', 'Dibujo Asistido por Computadora I', NULL),
(107, 'IT', 'Introducción a la Topografía', NULL),
(108, 'HIDRB', 'Hidrología', NULL),
(109, 'TOPO-1', 'Topografía I', NULL),
(110, 'DAC-2', 'Dibujo Asistido por Computadora II', NULL),
(111, 'MF', 'Mecánica de Fluidos', NULL),
(112, 'LS', 'Laboratorio de Suelos', NULL),
(113, 'TOPO-2', 'Topografía II', NULL),
(114, 'MS', 'Mecánica de Suelos', NULL),
(115, 'MMA', 'Mecánica de Materiales Aplicada', NULL),
(116, 'AO', 'Administración de Obra', NULL),
(117, 'TOPO-3', 'Topografía III', NULL),
(118, 'AE', 'Análisis Estructural', NULL),
(119, 'LP', 'Laboratorio de Pavimentos', NULL),
(120, 'SIC', 'Sistemas Innovadores para la Construcción', NULL),
(121, 'TC-1', 'Tecnología del Concreto I', NULL),
(122, 'EA', 'Estructuras de Acero', NULL),
(123, 'SE', 'Software Estructural', NULL),
(124, 'FE', 'Fundamentos de la Edificación', NULL),
(125, 'CCVO', 'Control de Calidad y Volúmenes de Obra', NULL),
(126, 'PIC-1', 'Proyecto Integrador de Construcción I', NULL),
(127, 'SEC', 'Software Especializado para la Construcción', NULL),
(128, 'TC-2', 'Tecnología del Concreto II', NULL),
(129, 'EC', 'Estructuras de Concreto', NULL),
(130, 'CM', 'Cimentaciones y Mampostería', NULL),
(131, 'IHS', 'Instalaciones Hidráulicas y Sanitarias', NULL),
(132, 'RA', 'Redes de Alcantarillado', NULL),
(133, 'AO-2', 'Administración de Obra II', NULL),
(134, 'PIC-2', 'Proyecto Integrador de Construcción II', NULL),
(135, 'CEB', 'Componentes Eléctricos', NULL),
(136, 'TE', 'Taller Electrónico', NULL),
(137, 'PFH-1', 'Pensamiento Filosófico y Humanidades I', NULL),
(138, 'FE-1', 'Fundamentos de Electrónica I', NULL),
(139, 'CCD', 'Circuitos de Corriente Directa', NULL),
(140, 'MEL', 'Manejo de Equipo de Laboratorio', NULL),
(141, 'FE-2', 'Fundamentos de Electrónica II', NULL),
(142, 'CCA', 'Circuitos de Corriente Alterna', NULL),
(143, 'DCI', 'Diseño de Circuitos Impresos', NULL),
(144, 'CA', 'Circuitos Amplificadores', NULL),
(145, 'ICB', 'Introducción a las Comunicaciones', NULL),
(146, 'RDP', 'Redes de Dos Puertos', NULL),
(147, 'CL', 'Circuitos Lógicos', NULL),
(148, 'CAO', 'Circuitos con Amplificador Operacional', NULL),
(149, 'CR', 'Circuitos Retroalimentados', NULL),
(150, 'CAB', 'Comunicaciones Analógicas', NULL),
(151, 'SD', 'Sistemas Digitales', NULL),
(152, 'CD', 'Comunicaciones Digitales', NULL),
(153, 'EAB', 'Electrónica Aplicada', NULL),
(154, 'FPE', 'Fundamentos de Proyecto Electrónico', NULL),
(155, 'RP', 'Redes y Protocolos', NULL),
(156, 'EIC', 'Electrónica Industrial', NULL),
(157, 'MC', 'Microprocesadores y Controladores', NULL),
(158, 'AR', 'Análisis de Radiofrecuencia', NULL),
(159, 'PIE-1', 'Proyecto Integrador de Electrónica I', NULL),
(160, 'SEB', 'Sistemas Embebidos', NULL),
(161, 'CAC', 'Comunicaciones Aplicadas', NULL),
(162, 'ADS', 'Análisis Digital de Señales', NULL),
(163, 'MEB', 'Mantenimiento Electrónico', NULL),
(164, 'EGPI', 'Estrategias para la Gestión de Procesos Industriales', NULL),
(165, 'PIE-2', 'Proyecto Integrador de Electrónica II', NULL),
(166, 'ITB', 'Introducción al Trabajo de Banco', NULL),
(167, 'MD-1', 'Metrología Dimensional I', NULL),
(168, 'TORN-1', 'Torneado I', NULL),
(169, 'MD-2', 'Metrología Dimensional II', NULL),
(170, 'CM-1', 'Conocimiento de Materiales I', NULL),
(171, 'TORN-2', 'Torneado II', NULL),
(172, 'MD-3', 'Metrología Dimensional III', NULL),
(173, 'DM', 'Dibujo Mecánico', NULL),
(174, 'SAE', 'Soldadura por Arco Eléctrico', NULL),
(175, 'FRES', 'Fresado', NULL),
(176, 'RM-1', 'Resistencia de Materiales I', NULL),
(177, 'EB', 'Electricidad Básica', NULL),
(178, 'MD-4', 'Metrología Dimensional IV', NULL),
(179, 'RM-2', 'Resistencia de Materiales II', NULL),
(180, 'RAH', 'Rectificado y Afilado de Herramientas', NULL),
(181, 'EM-2', 'Elementos Mecánicos II', NULL),
(182, 'MFB', 'Modelería y Fundición', NULL),
(183, 'EII', 'Electricidad e Instalaciones Industriales', NULL),
(184, 'SA', 'Soldadura Autógena', NULL),
(185, 'DACB', 'Diseño Asistido por Computadora', NULL),
(186, 'CNAC-1', 'Control Numérico Asistido por Computadora I', NULL),
(187, 'MP', 'Manufactura de Plásticos', NULL),
(188, 'CSE', 'Control de Sistemas Electromecánicos', NULL),
(189, 'PDMI-1', 'Proyecto de Diseño y Mecánica Industrial I', NULL),
(190, 'DMB', 'Diseño de Máquinas', NULL),
(191, 'CNC-2', 'Control Numérico Computarizado II', NULL),
(192, 'HN', 'Hidráulica y Neumática', NULL),
(193, 'MM', 'Mantenimiento Mecánico', NULL),
(194, 'SMT', 'Soldadura MIG y TIG', NULL),
(195, 'DFH', 'Diseño y Fabricación de Herramientas', NULL),
(196, 'DMC', 'Diseño de Moldes', NULL),
(197, 'AM', 'Análisis Metalográfico', NULL),
(198, 'FI', 'Fundamentos de Instrumentación', NULL),
(199, 'MG', 'Metrología General', NULL),
(200, 'CE-1', 'Circuitos Eléctricos I', NULL),
(201, 'II-1', 'Instrumentación Industrial I', NULL),
(202, 'DTI', 'Dibujo Técnico Industrial', NULL),
(203, 'CE-2', 'Circuitos Eléctricos II', NULL),
(204, 'II-2', 'Instrumentación Industrial II', NULL),
(205, 'EBB', 'Electrónica Básica', NULL),
(206, 'INGL-3', 'Inglés III', NULL),
(207, 'STB', 'Sensores y Transductores', NULL),
(208, 'MVF', 'Medición de Variables Físicas', NULL),
(209, 'MVA', 'Medición de Variables Analíticas', NULL),
(210, 'SCC', 'Sistemas de Control Clásico', NULL),
(211, 'CLP', 'Controladores Lógicos Programables (PLC)', NULL),
(212, 'NH', 'Neumática e Hidráulica', NULL),
(213, 'MICR', 'Microcontroladores', NULL),
(214, 'SCD', 'Sistemas de Control Distribuido (DCS)', NULL),
(215, 'MSC', 'Mantenimiento a Sistemas de Control', NULL),
(216, 'SOP', 'Sintonización y Optimización de Procesos', NULL),
(217, 'SIP', 'Seguridad e Instrumentación en Plantas', NULL),
(218, 'CAP', 'Control Avanzado de Procesos', NULL),
(219, 'PPT', 'Prácticas Profesionales Tecnológicas', NULL),
(220, 'IE', 'Introducción a la Electromecánica', NULL),
(221, 'TAM', 'Taller de Ajuste Mecánico', NULL),
(222, 'TMH', 'Taller de Máquinas Herramientas', NULL),
(223, 'DTAC', 'Dibujo Técnico Asistido por Computadora', NULL),
(224, 'TM', 'Tecnología de los Materiales', NULL),
(225, 'TB', 'Termodinámica Básica', NULL),
(226, 'IEI', 'Instalaciones Eléctricas Industriales', NULL),
(227, 'RMB', 'Resistencia de Materiales', NULL),
(228, 'MEER', 'Máquinas Eléctricas Estáticas y Rotatorias', NULL),
(229, 'CME', 'Control de Motores Eléctricos', NULL),
(230, 'SNH', 'Sistemas Neumáticos e Hidráulicos', NULL),
(231, 'MEC', 'Mantenimiento Electromecánico', NULL),
(232, 'SED', 'Subestaciones Eléctricas', NULL),
(233, 'RAA', 'Refrigeración y Aire Acondicionado', NULL),
(234, 'EE', 'Eficiencia Energética', NULL),
(235, 'DFE', 'Diagnóstico de Fallas Electromecánicas', NULL),
(236, 'GM', 'Gestión del Mantenimiento', NULL),
(237, 'IMA', 'Introducción a la Mecánica Automotriz', NULL),
(238, 'HET', 'Herramientas y Equipos de Taller', NULL),
(239, 'MA', 'Metrología Automotriz', NULL),
(240, 'MCI-1', 'Motores de Combustión Interna I', NULL),
(241, 'EABB', 'Electricidad Automotriz Básica', NULL),
(242, 'DA', 'Dibujo Automotriz', NULL),
(243, 'MCI-2', 'Motores de Combustión Interna II', NULL),
(244, 'STM', 'Sistemas de Tren Motriz (Embrague y Cajas de Cambio)', NULL),
(245, 'EA-1', 'Electrónica Automotriz I', NULL),
(246, 'SF', 'Sistemas de Frenos (Abs y Convencionales)', NULL),
(247, 'DS', 'Dirección y Suspensión', NULL),
(248, 'TA', 'Transmisiones Automáticas', NULL),
(249, 'IEG', 'Inyección Electrónica a Gasolina', NULL),
(250, 'EA-2', 'Electrónica Automotriz II', NULL),
(251, 'SCA', 'Sistemas de Climatización Automotriz', NULL),
(252, 'SID', 'Sistemas de Inyección Diesel', NULL),
(253, 'RCA', 'Redes de Comunicación Automotriz (CAN Bus)', NULL),
(254, 'AUTOB', 'Autotrónica', NULL),
(255, 'DEAE', 'Diagnóstico Electrónico Automotriz por Escáner', NULL),
(256, 'VHE-1', 'Vehículos Híbridos y Eléctricos I', NULL),
(257, 'TAE', 'Taller de Afinación y Emisiones', NULL),
(258, 'DVHE-2', 'Diagnóstico de Vehículos Híbridos y Eléctricos II', NULL),
(259, 'MFV', 'Mantenimiento de Flotas Vehiculares', NULL),
(260, 'ATA', 'Administración de Talleres Automotrices', NULL),
(261, 'QGI', 'Química General e Inorgánica', NULL),
(262, 'ILQ', 'Introducción al Laboratorio Químico', NULL),
(263, 'QO-1', 'Química Orgánica I', NULL),
(264, 'QAC', 'Química Analítica Cualitativa', NULL),
(265, 'ESTE', 'Estequiometría', NULL),
(266, 'QO-2', 'Química Orgánica II', NULL),
(267, 'QACB', 'Química Analítica Cuantitativa', NULL),
(268, 'FISI', 'Fisicoquímica', NULL),
(269, 'BG', 'Bioquímica General', NULL),
(270, 'AI-1', 'Análisis Instrumental I', NULL),
(271, 'OUIF', 'Operaciones Unitarias en la Industria Farmacéutica', NULL),
(272, 'MGB', 'Microbiología General', NULL),
(273, 'AI-2', 'Análisis Instrumental II', NULL),
(274, 'FG', 'Farmacología General', NULL),
(275, 'MFC', 'Microbiología Farmacéutica', NULL),
(276, 'QF', 'Química Farmacéutica', NULL),
(277, 'TF-1', 'Tecnología Farmacéutica I (Formas Sólidas)', NULL),
(278, 'TF-2', 'Tecnología Farmacéutica II (Formas Líquidas y Semisólidas)', NULL),
(279, 'CCF', 'Control de Calidad Farmacéutico', NULL),
(280, 'LNF', 'Legislación y Normatividad Farmacéutica (NOM/FEUM)', NULL),
(281, 'VPF', 'Validación de Procesos Farmacéuticos', NULL),
(282, 'AC', 'Aseguramiento de la Calidad', NULL),
(283, 'BF', 'Biotecnología Farmacéutica', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `token_seguridad`
--

CREATE TABLE `token_seguridad` (
  `id_token` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL COMMENT 'Hash del token de recuperación/activación',
  `tipo` enum('Activacion_Cuenta','Recuperacion_Password') NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` datetime DEFAULT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash seguro con password_hash()',
  `rol` enum('Alumno','Asesor','Admin') NOT NULL,
  `correo_validado` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = Validado (Kutt.me verificado)',
  `intentos_fallidos` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Control de bloqueos por fuerza bruta',
  `fecha_bloqueo` datetime DEFAULT NULL COMMENT 'Tiempo de suspensión temporal',
  `foto_perfil` varchar(255) DEFAULT NULL,
  `calificacion_promedio` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asesor_materia`
--
ALTER TABLE `asesor_materia`
  ADD PRIMARY KEY (`id_usuario`,`id_materia`),
  ADD KEY `fk_asesormateria_materia` (`id_materia`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `fk_cita_alumno` (`id_alumno`),
  ADD KEY `fk_cita_asesor` (`id_asesor`),
  ADD KEY `fk_cita_materia` (`id_materia`);

--
-- Indices de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD PRIMARY KEY (`id_disponibilidad`),
  ADD KEY `fk_disponibilidad_asesor` (`id_asesor`);

--
-- Indices de la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  ADD PRIMARY KEY (`id_evaluacion`),
  ADD KEY `fk_evaluacion_cita` (`id_cita`),
  ADD KEY `fk_evaluacion_evaluador` (`id_evaluador`),
  ADD KEY `fk_evaluacion_evaluado` (`id_evaluado`);

--
-- Indices de la tabla `materia`
--
ALTER TABLE `materia`
  ADD PRIMARY KEY (`id_materia`),
  ADD UNIQUE KEY `uk_materia_clave` (`clave`);

--
-- Indices de la tabla `token_seguridad`
--
ALTER TABLE `token_seguridad`
  ADD PRIMARY KEY (`id_token`),
  ADD KEY `fk_token_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uk_usuario_codigo` (`codigo`),
  ADD UNIQUE KEY `uk_usuario_correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  MODIFY `id_disponibilidad` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  MODIFY `id_evaluacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materia`
--
ALTER TABLE `materia`
  MODIFY `id_materia` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=284;

--
-- AUTO_INCREMENT de la tabla `token_seguridad`
--
ALTER TABLE `token_seguridad`
  MODIFY `id_token` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asesor_materia`
--
ALTER TABLE `asesor_materia`
  ADD CONSTRAINT `fk_asesormateria_materia` FOREIGN KEY (`id_materia`) REFERENCES `materia` (`id_materia`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_asesormateria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cita_asesor` FOREIGN KEY (`id_asesor`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cita_materia` FOREIGN KEY (`id_materia`) REFERENCES `materia` (`id_materia`) ON DELETE CASCADE;

--
-- Filtros para la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD CONSTRAINT `fk_disponibilidad_asesor` FOREIGN KEY (`id_asesor`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  ADD CONSTRAINT `fk_evaluacion_cita` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evaluacion_evaluado` FOREIGN KEY (`id_evaluado`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evaluacion_evaluador` FOREIGN KEY (`id_evaluador`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `token_seguridad`
--
ALTER TABLE `token_seguridad`
  ADD CONSTRAINT `fk_token_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
