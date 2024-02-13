<template>
  <div class="entrar">
    <div class="container mt-2">
      <h1 class="text-center">Vale único de resguardo de bienes muebles</h1>
      <v-row>
        <v-col cols="12">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field label="UNIDAD RESPONSABLE" v-model="unidadResponsable" @input="toUpper"
                  maxlength="31"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-menu :close-on-content-click="true" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field label="FECHA" readonly v-bind="attrs" v-on="on" v-model="fecha"></v-text-field>
                  </template>
                  <v-date-picker v-model="fecha" @input="menu = false" style="height: 470px;"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field label="ÁREA" v-model="area" @input="toUpper" maxlength="26"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field label="CENTRO DE TRABAJO" v-model="centroTrabajo" @input="toUpper"
                  maxlength="18"></v-text-field>
              </v-col>
              <v-col cols="12">
                <h5 class="mb-0">DATOS DEL SERVIDOR PÚBLICO</h5>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field label="NOMBRE" v-model="nombre" @input="toUpper" maxlength="40"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field label="CURP" v-model="curp" @input="toUpper" maxlength="18"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-menu :close-on-content-click="true" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field label="FECHA ELABORACIÓN" readonly v-bind="attrs" v-on="on"
                      v-model="fechaElaboracion"></v-text-field>
                  </template>
                  <v-date-picker v-model="fechaElaboracion" @input="menu = false" style="height: 470px;"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="4">
                <v-list>
                  <v-list-item v-for="(item, index) in activosSeleccionados" :key="index">
                    <v-list-item-content>
                      <v-chip class="custom-chip custom-v-chip" color="#9575cd">
                        {{ item.Nombre }}
                        <v-btn icon @click="quitarActivo(index)" class="ml-auto">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-chip>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="search" label="Buscar activo" append-icon="mdi-magnify"
                  class="mb-3"></v-text-field>
                <v-data-table :items="filteredActivos" :headers="headers" class="elevation-1">
                  <template v-slot:item="{ item }">
                    <tr>
                      <td>{{ item.aID }}</td>
                      <td>{{ item.NoInventario }}</td>
                      <td>{{ item.Nombre }}</td>
                      <td>{{ item.Marca }}</td>
                      <td>{{ item.Modelo }}</td>
                      <td>{{ item.Serie }}</td>
                      <td>{{ item.NombreDepartamento }}</td>
                      <td>
                        <v-btn icon @click="agregarActivo(item)">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn color="primary" @click="validarCampos">Imprimir</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import axios from 'axios';
import sepImage from "@/assets/sep.png";

export default {
  name: "ValeResguardoBienes",
  data() {
    return {
      curp: "",
      fechaElaboracion: "",
      nombre: "",
      unidadResponsable: "INSTITUTO TECNOLÓGICO DE CULIACÁN",
      fecha: "",
      area: "",
      centroTrabajo: "25DIT00021",
      datosServidorPublico: "",
      activosSeleccionados: [],
      search: '',
      headers: [
        { text: 'ID', value: 'aID' },
        { text: 'N. Inventario', value: 'NoInventario' },
        { text: 'Nombre', value: 'Nombre' },
        { text: 'Marca', value: 'Marca' },
        { text: 'Modelo', value: 'Modelo' },
        { text: 'Serie', value: 'Serie' },
        { text: 'Departamento', value: 'NombreDepartamento' },
        { text: 'Agregar', value: 'agregar', sortable: false }
      ],
      activos: []
    };
  },
  computed: {
    // Búsqueda de activos por todas sus columnas.
    filteredActivos() {
      return this.activos.filter((activo) => {
        const searchTerm = this.search.toLowerCase();
        for (const key in activo) {
          if (activo[key] && activo[key].toString().toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        return false;
      });
    },
  },
  methods: {
    toUpper() {
      this.unidadResponsable = this.unidadResponsable.toUpperCase();
      this.area = this.area.toUpperCase();
      this.centroTrabajo = this.centroTrabajo.toUpperCase();
      this.nombre = this.nombre.toUpperCase();
      this.curp = this.curp.toUpperCase();
    },
    validarCampos() {
      // Array con los nombres de los campos obligatorios
      const camposObligatorios = [
        'unidadResponsable',
        'fecha',
        'area',
        'centroTrabajo',
        'nombre',
        'curp',
        'fechaElaboracion',
      ];

      // Verificar si todos los campos obligatorios están llenos
      const camposVacios = camposObligatorios.filter(campo => !this[campo]);

      if (camposVacios.length > 0) {
        // Mostrar mensaje de error
        this.alertaToast("warning", "Por favor, complete todos los campos obligatorios.");

        // Marcar los campos vacíos visualmente
        camposVacios.forEach(campo => {
          this.marcarCampoVacio(campo);
        });

        return;
      }

      if (this.curp.length !== 18) {
        this.alertaToast("warning", "Por favor, ingrese una CURP válida.");
        return;
      }

      if (this.activosSeleccionados.length === 0) {
        this.alertaToast("warning", "Por favor, seleccione al menos un activo.");
        return;
      }

      // Si todos los campos están llenos, proceder con la impresión
      this.imprimirPDF();
    },
    guardaVale() {
      // Construir el objeto de datos para enviar al servidor
      const dataToSend = {
        vale: {
          unidadResponsable: this.unidadResponsable,
          fecha: this.fecha,
          area: this.area,
          centroTrabajo: this.centroTrabajo,
          nombre: this.nombre,
          curp: this.curp,
          fechaElaboracion: this.fechaElaboracion,
        },
        activosSeleccionados: this.activosSeleccionados.map(activo => activo.aID),
      };

      // Hacer la solicitud al servidor
      axios.post('http://localhost:3000/api/vales/guardar', dataToSend)
        .then(response => {
          // Manejar la respuesta del servidor si es necesario
          console.log('Vale guardado con éxito:', response.data);
        })
        .catch(error => {
          console.error('Error al guardar el vale:', error);
        });
    },
    agregarActivo(bien) {
      const activoExistente = this.activosSeleccionados.find(a => a.Nombre === bien.Nombre);

      if (!activoExistente) {
        this.activosSeleccionados.push(bien);
      } else {
        // Muestra un mensaje de error o toma alguna otra acción
        this.alertaToast("warning", "El activo ya ha sido agregado");
      }
    }, quitarActivo(index) {
      // Método para quitar un bien de la lista de seleccionados
      this.activosSeleccionados.splice(index, 1);
    },
    imprimirPDF() {
      const data = {
        unidadResponsable: this.unidadResponsable,
        fecha: this.fecha,
        area: this.area,
        centroTrabajo: this.centroTrabajo,
        datosServidorPublico: this.datosServidorPublico,
        activosSeleccionados: this.activosSeleccionados,
        nombre: this.nombre,
        curp: this.curp,
        fechaElaboracion: this.fechaElaboracion
      };

      const doc = new jsPDF({
        orientation: 'landscape',
      });

      doc.addImage(sepImage, 'PNG', 10, 10, 55, 25);

      // Establecer la fuente en negrita
      doc.setFont('helvetica', 'bold');

      doc.text("SEP", 145, 20, "center");
      doc.text("VALE ÚNICO DE RESGUARDO DE BIENES MUEBLES", 145, 30, "center");

      // Sección 1
      doc.setFont('helvetica', 'bold');
      doc.text("Unidad responsable: ", 80, 50, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.unidadResponsable || ''}`, 82, 50, { align: "left" });

      doc.setFont('helvetica', 'bold');
      doc.text("Fecha: ", 220, 50, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.fecha || ''}`, 222, 50, { align: "left" });

      // Sección 2
      doc.setFont('helvetica', 'bold');
      doc.text("Área: ", 49, 60, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.area || ''}`, 52, 60, { align: "left" });

      doc.setFont('helvetica', 'bold');
      doc.text("Centro de trabajo: ", 200, 60, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.centroTrabajo || ''}`, 202, 60, { align: "left" });

      // Restablecer la fuente a normal
      doc.setFont('helvetica', 'bold');

      // Sección 3
      doc.setFont('helvetica', 'bold');
      doc.text("DATOS DEL SERVIDOR PÚBLICO", 145, 75, "center");
      doc.setFont('helvetica', 'normal');

      // Línea 1: Nombre
      doc.setFont('helvetica', 'bold');
      doc.text("Nombre: ", 88, 90, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.nombre || ''}`, 92, 90, { align: "left" });

      // Línea 2: CURP y Fecha de Elaboración
      doc.setFont('helvetica', 'bold');
      doc.text("CURP: ", 80, 100, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.curp || ''}`, 82, 100, { align: "left" });

      doc.setFont('helvetica', 'bold');
      doc.text("Fecha elaboración: ", 210, 100, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.fechaElaboracion || ''}`, 212, 100, { align: "left" });

      // Espacio en blanco para firma
      doc.setFont('helvetica', 'bold');
      doc.text("FIRMA", 145, 112, "center");
      doc.text("___________________________", 145, 125, "center");

      // Sección 4
      doc.setFont('helvetica', 'bold');
      doc.text("BIENES ASIGNADOS", 145, 140, "center");
      doc.setFont('helvetica', 'normal');

      // Tabla de activos
      const rows = data.activosSeleccionados.map(bien => [
        bien.aID || '',
        bien.NoInventario || '', bien.Nombre || '', bien.Marca || '', bien.Modelo || '', bien.Serie || '', bien.NombreDepartamento || ''
      ]);

      doc.autoTable({
        head: [["ID", "N. Inventario", "Nombre", "Marca", "Modelo", "Serie", "Departamento"]],
        body: rows,
        startY: 145,
        theme: "grid"
      });

      this.guardaVale();
      doc.save("vale_resguardo.pdf");
      this.alertaToast("success", "PDF generado.");

    },
    alertaToast(icono, titulo) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: toast => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        }
      });

      Toast.fire({
        icon: icono,
        title: titulo
      });
    }
  },
  created() {
    axios.get('http://localhost:3000/api/vales/inventory')
      .then(response => {
        this.activos = response.data;
      })
      .catch(error => {
        console.error('Error al cargar el inventario', error);
      });
  },
};
</script>

<style scoped>
.custom-chip.custom-v-chip {
  border-radius: 20px !important;
  /* Usa !important para asegurar que sobrescriba las reglas predeterminadas */
  font-size: 18px !important;
  width: 50% !important;
  margin-bottom: 8px !important;
  height: 50px !important;
}

/* Alinea el botón al final del chip */
.v-btn.ml-auto {
  margin-left: auto;
}

.entrar {
    animation: entrada 0.7s ease;
}

@keyframes entrada {
    from {
        opacity: 0;
    }

    to {
        opacity: 100%;
    }
}
</style>
