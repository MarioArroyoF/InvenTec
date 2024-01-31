<template>
    <div class="imagen-container">
      <img class="logotec" src="../assets/teclogo.png" alt="Logo del Instituto Tecnológico de Culiacán" />
      <div class="label-container">
        <label class="font-weight">InvenTec - Instituto Tecnológico de Culiacán</label>
      </div>
  </div>
</template>
  
<script>
export default {
  data() {
    return {
      dialogEditar: false,
      dialogEditar: false,
      updates: [
        { fecha: '2023-11-01', departamento: 'Industrial', articulo: 'Producto A', descripcion: 'Actualización de stock' },
        { fecha: '2023-10-28', departamento: 'Bioquímica', articulo: 'Producto B', descripcion: 'Nueva adición' },
        // ... más datos ...
      ],
    };
  },
  methods: {
    abrirDialogEditar() {
      this.dialogEditar = true;
    },
    cerrarDialogEditar() {
      // Lógica para guardar los cambios del formulario (si es necesario)
      this.dialogEditar = false;
    },
    verDetalle() {
      // Lógica para ver el detalle (puedes implementar esta función)
    },
  },
};
</script>
  
<style>

.imagen-container {
  text-align: center;
}

.logotec {
  width: 600px;
  max-width: 80%;
}

.label-container {
  margin-top: 10px;
}

.font-weight-medium {
  font-size: 1.5em;
  /* Adjust the font size as needed */
  color: var(--color-primary);
}

:root {
  --color-primary: #5b8bf7;
  --color-secondary: #f2f2f2;
  --color-success: #4caf50;
  --color-text: #333;
  --font-family-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-family-title: 'Roboto', sans-serif;
}

.cuerpo {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px;
  gap: 20px;
  /* Añade espacio entre elementos cuando se envuelvan */
}

.perfil {
  background-color: var(--color-secondary);
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease-in-out;
  /* Transición suave para la sombra */
  padding: 20px;
  /* Espacio interno para evitar desbordes */
  overflow: hidden;
  /* Previene el desborde del contenido */
}

.perfil:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.perfil .usuario .font-weight-medium {
  color: var(--color-text);
  font-family: var(--font-family-title);
  font-size: 1.1em;
  /* Ajusta el tamaño del texto si es necesario */
  white-space: nowrap;
  /* Previene el salto de línea del nombre */
  overflow: hidden;
  /* Oculta el texto que se desborde */
  text-overflow: ellipsis;
  /* Añade "..." si el texto se desborda */
  display: block;
  /* Asegura que el texto se muestre en una línea */
}

.v-btn {
  transition: background-color 0.3s ease;
  /* Transición suave para el color de fondo */
  margin-top: 10px;
  /* Espacio sobre el botón */
  font-size: 0.9em;
  /* Ajusta el tamaño del texto del botón si es necesario */
}

.v-btn:hover {
  filter: brightness(110%);
}

.tabla {
  background-color: var(--color-secondary);
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-x: auto;
  /* Espacio interno para la tabla */
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 8px;
  text-align: center;
}

th {
  background-color: var(--color-primary);
  color: #ffffff;
}

th:first-child,
td:first-child {
  /* Estilo para la primera columna (Fecha) */
  min-width: 100px;
}

.usuario {
  padding: 20px;
  /* Espacio interno alrededor del contenido del usuario */
}

.imagen-container {
  margin: 0 auto;
  /* Centra el contenedor de la imagen */
  padding: 20px;
}

.iusuario {
  width: auto;
  /* Ajusta el ancho de la imagen automáticamente */
  max-width: 100%;
  /* Asegura que la imagen no sea más grande que su contenedor */
  border-radius: 100%;
  /* Resto del código ... */
}

.v-simple-table {
  max-width: 100%;
  width: 100%;
  overflow-x: auto; /* Permite desplazamiento en dispositivos pequeños */
}

.v-simple-table thead th {
  background-color: var(--color-primary);
  color: white;
  padding: 16px;
  font-weight: bold;
}

.v-simple-table tbody td {
  background-color: white;
  color: var(--color-text);
  padding: 16px;
  border-bottom: 1px solid #e1e1e1;
}

/* Ajustes para la vista móvil */
@media (max-width: 768px) {

  .tabla {
    width: 100%; /* Ajusta el ancho de la tabla para pantallas pequeñas */
    margin-top: 20px; /* Asegura espacio suficiente encima de la tabla */
  }

  .v-simple-table {
    min-width: 600px; /* Establece un ancho mínimo para la tabla */
  }

  .perfil .usuario .font-weight-medium {
    font-size: 16px; /* Ajuste del tamaño de la fuente para nombres más largos */
    padding: 0 10px; /* Espacio horizontal para prevenir desbordamiento */
  }

  .v-btn {
    padding: 8px 16px; /* Ajuste del tamaño de los botones */
  }

  .v-simple-table {
    font-size: 14px; /* Ajuste del tamaño de la fuente de la tabla */
  }
}




@media (max-width: 430px) {
  .cuerpo {
    flex-direction: column;
    /* Los elementos se apilan verticalmente */
    align-items: center;
    /* Centra los elementos horizontalmente */
  }

  .perfil {
    width: 90%;
    /* Ajusta el ancho de los contenedores para dispositivos móviles */
    max-width: 90%;
    /* Asegura que los contenedores no sean más anchos que el 90% */
    margin-bottom: 20px;
    /* Espacio debajo de cada contenedor */
  }

  .usuario {
    padding: 0;
    /* Remueve el padding para ahorrar espacio */
  }

  .imagen-container {
    padding: 20px;
  }

  .iusuario {
    width: auto;
    /* Ajusta el ancho de la imagen automáticamente */
    max-width: 100%;
    /* Asegura que la imagen no sea más grande que el contenedor */
    height: auto;
    /* Mantiene la relación de aspecto de la imagen */
  }

  .font-weight-medium {
    font-size: 1em;
    /* Disminuye el tamaño del texto para ajustarse al contenedor */
  }

  .v-btn {
    font-size: 0.8em;
    /* Disminuye el tamaño del texto en los botones */
  }
}</style>

