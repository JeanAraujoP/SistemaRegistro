CREATE DATABASE Trazabilidad_SGVA;
USE Trazabilidad_SGVA;

CREATE TABLE Trazabilidad (
	id_Trazabilidad INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_Empresa VARCHAR(50) NULL,
    encargado VARCHAR(20) NOT NULL,
    fecha_Inicio DATE NOT NULL,
    fecha_Fin DATE NOT NULL,
    telefono INT NOT NULL,
	correo VARCHAR(50) NOT NULL,
	estado VARCHAR(45) NOT NULL,
    fecha_Cierre DATE NOT NULL
);

CREATE TABLE Empresa (
	id_Empresa INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    codigoEmpresa INT NOT NULL,
    nombreEmpresa VARCHAR(50) NOT NULL
);