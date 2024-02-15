
create table Usuarios (
UsrId INT IDENTITY(1, 1) NOT NULL,
UsrNombre nvarchar(255) not null,
UsrCorreo nvarchar(255) not null,
UsrTipo int not null,
UsrToken nvarchar(255) not null,
UsrFecha date not null)

GO
create table Jefes (
JefeId INT IDENTITY(50, 1) NOT NULL,
JefeNombre nvarchar(255) not null,
JefeTipo bit not null,
Depclave INT not null)

GO
CREATE TABLE Departamentos (
Depclave INT IDENTITY(400, 1) NOT NULL,
Depdepto NVARCHAR(255) not null,
Depalias NVARCHAR(50) not null,
JefeId INT default '0'
);

GO
create table Areas (
AreaId INT IDENTITY(200, 1) NOT NULL,
AreaNombre nvarchar(255) not null,
JefeId int not null,
Depclave int not null)

GO
create table Activos (
ActId INT IDENTITY(100, 1) NOT NULL,
ActIdSep nvarchar(255),
ActNoInv nvarchar(255),
ActCaracteristicas nvarchar(255) not null,
ActMarca nvarchar(255),
ActModelo nvarchar(255),
ActSerie nvarchar(255),
ActValor decimal(18,2),
ActCabm nvarchar(255),
ActNombre nvarchar(255) not null,
ActObser nvarchar(255),
AreaId int not null,
Depclave int not null,
ActFechaAlta datetime default getDate())
GO
alter table Usuarios add constraint PK_Usuarios primary key (UsrId)
alter table Jefes add constraint PK_Jefes primary key (JefeId)
alter table Departamentos add constraint PK_Departamentos primary key (Depclave)
alter table Areas add constraint PK_Areas primary key (AreaId)
alter table Activos add constraint PK_Activos primary key (ActId)

GO
alter table Areas add
constraint FK_Areas_Departamentos foreign key (Depclave) references Departamentos (Depclave),
constraint FK_Areas_Jefes foreign key (JefeId) references Jefes (JefeId)
GO
alter table Activos add
constraint FK_Activos_Areas foreign key (AreaId) references Areas (AreaId)

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE PLANEACION PROGRAMACION Y PRESUPUESTACION', 'PLANEACION');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE GESTION TECNOLOGICA Y VINCULACION', 'GESTION TECNOL.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE COMUNICACION Y DIFUSION', 'COMUNICACION');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE SERVICIOS ESCOLARES', 'SERVS.ESCS.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE CENTRO DE INFORMACION', 'CTR.INFORMACION');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE CIENCIAS BASICAS', 'C.BASICAS');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE SISTEMAS Y COMPUTACION', 'SIST. Y COMP.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE ELECTRICA-ELECTRONICA', 'ELECTRICA-ELECTRONIC');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE INGENIERIA BIOQUIMICA', 'QUIMICA BIOQUIM');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE INGENIERIA INDUSTRIAL', 'ING.INDUSTRIAL');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE ECONOMICO ADMINISTRATIVAS', 'ECON.ADMTVAS');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE DESARROLLO ACADEMICO', 'DESARROLLO ACA.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE DIVISION DE ESTUDIOS PROFESIONALES', 'DIV.EST.PROF.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DIVISION DE ESTUDIOS DE POSGRADO', 'DIV.EST.POSTG.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE RECURSOS HUMANOS', 'REC.HUMANOS');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE RECURSOS FINANCIEROS', 'REC.FINANCIEROS');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE RECURSOS MATERIALES Y SERVICIOS', 'REC.MAT.SERVC.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE CENTRO DE COMPUTO', 'CTR.COMPUTO');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('SUBDIRECCION DE SERVICIOS ADMINISTRATIVOS', 'SUBD.ADMINIST.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE MANTENIMIENTO Y EQUIPO', 'DPTO.MATTO.EQU.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('SUBDIRECCION DE PLANEACION Y VINCULACION', 'SUBD.PLANEACION');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DIRECTOR', 'DIRECTOR');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE METAL-MECANICA', 'METAL-MECANICA');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE PROMOCION CULTURAL Y DEPORTIVA', 'PROM. CULT Y DEP.');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('SUBDIRECCION ACADEMICA', 'SUB. ACADEMICA');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('DEPARTAMENTO DE PLANEACION Y VINCULACION', 'PLANEACION');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('COORDINADOR DE PROYECTOS DE INVESTIGACION', 'CPI');

INSERT INTO Departamentos (Depdepto, Depalias)
VALUES ('ENCARGADO(A) DE DESPACHO DE DIRECCION', 'E. DE DESP. DE DIR.');

GO

CREATE TRIGGER ActualizarJefeDepartamento
ON Jefes
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

	-- Eliminar el jefe existente con JefeTipo=1 para la misma Depclave
    DELETE J
    FROM Jefes AS J
    INNER JOIN inserted AS I ON J.depclave = I.depclave
    WHERE J.JefeTipo = 1
	AND J.JefeId <> I.JefeId
	AND I.JefeTipo = 1;

	 -- Actualizar el campo JefeId en la tabla de Departamentos
	UPDATE Departamentos
    SET JefeId = i.JefeId
    FROM Departamentos AS d
    INNER JOIN inserted AS i ON d.Depclave = i.Depclave
    WHERE i.JefeTipo = 1;

END;

GO

CREATE TRIGGER UpdateJefeDepartamento
ON Jefes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Actualizar el campo JefeId en la tabla de Departamentos donde JefeTipo = 1
    UPDATE d
    SET JefeId = i.JefeId
    FROM Departamentos AS d
    INNER JOIN inserted AS i ON d.Depclave = i.Depclave
    WHERE i.JefeTipo = 1;

	-- Cambiar todos los registros existentes con JefeTipo = 1 a JefeTipo = 0
    UPDATE j
    SET JefeTipo = 0
    FROM Jefes AS j
    INNER JOIN inserted AS I ON j.depclave = i.depclave
    WHERE i.JefeTipo = 1
	AND j.JefeId <> i.JefeId;

END;

GO

CREATE TRIGGER EliminarJefeDepartamento
ON Jefes
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Actualizar el campo JefeId en la tabla de Departamentos
    UPDATE Departamentos
    SET JefeId = 0
    FROM Departamentos AS d
    INNER JOIN deleted AS del ON d.Depclave = del.Depclave
    WHERE del.JefeTipo = 1;

END;

GO

create table Impresiones (
ImpNum int identity(1,1) not null,
ActId int not null,
ImpFecha datetime default getDate())

GO
alter table Impresiones add constraint PK_Impresiones primary key (ImpNum)
GO
alter table Impresiones add
constraint FK_Imp_Act foreign key (ActId) references Activos (ActId)

GO
create table ValesResguardo (
ValeId int identity(1,1),
fechaVale date,
ValeArea nvarchar(255) not null,
ValeCentroTrabajo nvarchar(255) not null,
ValeNombre nvarchar(255) not null,
ValeCurp nvarchar(255) not null,
ValeFechaElaboracion date
)

GO
alter table ValesResguardo add constraint PK_ValesResguardo primary key (ValeId)
GO

create table ValesxActivos (
ValeId int not null,
ActId int not null)

GO

alter table ValesxActivos 
add constraint PK_ValesxActivos foreign key (ValeId)
references ValesResguardo (ValeId)

GO
ALTER TABLE ValesxActivos
ADD CONSTRAINT FK_VxA_Activos
FOREIGN KEY (ActId)
REFERENCES Activos (ActId)
ON DELETE CASCADE;
GO
alter table Jefes add
constraint FK_Jefe_Dep foreign key (Depclave) references Departamentos (Depclave)

GO
alter table Activos add
constraint FK_Act_Dep foreign key (Depclave) references Departamentos (Depclave)

GO
create table Escaneo (
ActId int not null,
EscFecha datetime default getDate())

GO

ALTER TABLE Escaneo
ADD CONSTRAINT FK_Esc_Act
FOREIGN KEY (ActId)
REFERENCES Activos (ActId)
ON DELETE CASCADE;


