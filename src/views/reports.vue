<template>
  <div class="text-center entrar">
    <!-- <h1>Reportes</h1> -->
    <v-container>
      <v-row>
        <v-col>
          <v-tabs v-model="tab" centered>
            <v-tab v-for="(section, index) in sections" :key="index">
              {{ section.title }}
            </v-tab>
          </v-tabs>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="(section, index) in sections" :key="index">
              <v-card outlined tile class="pa-5">
                <div class="report-box">
                  <h2>{{ section.title }}</h2>

                  <!-- Sección de filtros específicos por tipo de reporte -->
                  <template v-if="index === 0 || index === 2 || index === 3">
                    <v-select v-if="index === 0 || index === 3" label="Seleccionar departamento*" :items="departamentos"
                      item-text="depdepto" item-value="depclave" v-model="actDepto"></v-select>
                    <v-menu v-if="index === 2" v-model="menuFecha" :close-on-content-click="true" :nudge-right="30"
                      transition="scale-transition">
                      <template v-slot:activator="{ on, attrs }">

                          <v-menu :close-on-content-click="true" :nudge-right="40" transition="scale-transition" offset-y
                            min-width="290px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field label="Seleccionar fecha*" readonly v-bind="attrs" v-on="on"
                                v-model="fechaSeleccionada"></v-text-field>
                            </template>
                            <v-date-picker v-model="fechaSeleccionada" @input="menu = false"
                              style="height: 470px;"></v-date-picker>
                          </v-menu>
                        <v-select label="Seleccionar departamento*" v-model="actDepto" :items="departamentos"
                          item-text="depdepto" item-value="depclave"></v-select>
                      </template>
                    </v-menu>



                    <v-radio-group v-if="index === 2" v-model="detalleReporte" row>
                      <v-radio label="Conteo" :value="true"></v-radio>
                      <v-radio label="Detalle" :value="false"></v-radio>
                    </v-radio-group>
                  </template>

                  <!-- Botones de generación de PDF y CSV -->
                  <div class="button-group">
                    <v-btn
                      @click="index === 0 ? activosPorDepartamento(1) : index === 1 ? totalActivos(1) : index === 2 ? inventarioPorFecha(1) : index === 3 ? impresionesPorDepto(1) : generarPDF(index + 1)"
                      color="red lighten-2">
                      <v-icon left>mdi-file-pdf-box</v-icon>
                      Generar PDF
                    </v-btn>
                    <v-btn
                      @click="index === 0 ? activosPorDepartamento(2) : index === 1 ? totalActivos(2) : index === 2 ? inventarioPorFecha(2) : index === 3 ? impresionesPorDepto(2) : generarCSV(index + 1)"
                      color="green lighten-2">
                      <v-icon left>mdi-file-excel</v-icon>
                      Generar CSV
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
      <v-col>
        <div class="report-box">
          <h3>Subir archivos de inventario</h3>
          <v-file-input label="Seleccionar archivo de inventario" v-model="archivoSeleccionado"
            accept=".csv, .txt"></v-file-input>
          <v-btn @click="subirArchivo" class="mb-3 green" dark>
            <v-icon>mdi-file-upload</v-icon> Subir archivo de inventario
          </v-btn>
        </div>
      </v-col>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from 'papaparse';

export default {
  name: 'reports',
  data: () => ({
    tab: null,
    sections: [
      { title: 'Activos por departamento' },
      { title: 'Total de activos' },
      { title: 'Detalle de inventario' },
      { title: 'Impresiones por departamento' }
    ],
    departamentos: [],
    actDepto: '',
    fechaSeleccionada: '',
    actPorDepartamento: [],
    totalActPorDepartamento: [],
    inventarioDeptoFecha: [],
    impPorDepto: [],
    detalleReporte: true,
  }),
  methods: {
    subirArchivo() {
      if (!this.archivoSeleccionado) {
        this.alertaToast('warning', 'Por favor selecciona un archivo.');
        return;
      }

      const formData = new FormData();
      formData.append('archivo', this.archivoSeleccionado);

      axios.post('http://localhost:3000/api/subirArchivo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(response => {
          console.log('Respuesta de la API:', response.data);
          this.alertaToast('success', 'Archivo subido exitosamente.');
        })
        .catch(error => {
          console.error('Error al subir el archivo:', error);
          this.alertaToast('warning', 'Error al subir el archivo, verifique su estructura.');
        });
    },
    async impresionesPorDepto(tipoReporte) {
      // Validar que se haya seleccionado un departamento
      const depclave = this.actDepto;
      if (!depclave) {
        this.alertaToast('warning', 'Selecciona un departamento antes de generar el reporte.');
        return;
      }

      // Toma el nombre del departamento seleccionado
      const departamentoSeleccionado = this.departamentos.find(depto => depto.depclave === depclave);
      const depdeptoSeleccionado = departamentoSeleccionado.depdepto;

      // Obtener los activos por departamento
      try {
        const response = await axios.get(`http://localhost:3000/api/reportes/impresionesPorDepto/${depclave}`);
        this.impPorDepto = response.data;
        console.log('Impresiones por departamento', this.actPorDepartamento);
      } catch (error) {
        console.error('Error al obtener impresiones por departamento', error);
        throw error;
      }

      // Generar el reporte
      switch (tipoReporte) {
        case 1:
          this.generarPDF(this.impPorDepto, 4, depdeptoSeleccionado, 0);
          break;
        case 2:
          this.generarCSV(this.impPorDepto, 4, depdeptoSeleccionado, 0);
          break;
        default:
          break;
      }

    },
    async inventarioPorFecha(tipoReporte) {
      // Validar que se haya seleccionado un departamento
      const depclave = this.actDepto;
      const selectedDate = this.fechaSeleccionada

      if (!depclave) {
        this.alertaToast('warning', 'Selecciona un departamento antes de generar el reporte.');
        return;
      }

      if (!selectedDate) {
        this.alertaToast('warning', 'Selecciona un fecha antes de generar el reporte.');
        return;
      }

      // Toma el nombre del departamento seleccionado
      const departamentoSeleccionado = this.departamentos.find(depto => depto.depclave === depclave);
      const depdeptoSeleccionado = departamentoSeleccionado.depdepto;

      if (this.detalleReporte) {
        // Conteo
        try {
          const response = await axios.get(`http://localhost:3000/api/reportes/inventarioPorDeptoFecha/${depclave}/${selectedDate}`);
          this.inventarioDeptoFecha = response.data;
          console.log('Inventario por depto y fecha', this.actPorDepartamento);
        } catch (error) {
          console.error('Error al obtener inventario por depto y fecha', error);
          throw error;
        }
      } else {
        // Detalle
        try {
          const response = await axios.get(`http://localhost:3000/api/reportes/detalleInventario/${depclave}/${selectedDate}`);
          this.inventarioDeptoFecha = response.data;
          console.log('Detalle inventario por depto y fecha', this.actPorDepartamento);
        } catch (error) {
          console.error('Error al obtener detalle inventario por depto y fecha', error);
          throw error;
        }
      }

      // Generar el reporte
      switch (tipoReporte) {
        case 1:
          this.generarPDF(this.inventarioDeptoFecha, 3, depdeptoSeleccionado, this.fechaSeleccionada);
          break;
        case 2:
          this.generarCSV(this.inventarioDeptoFecha, 3, depdeptoSeleccionado, this.fechaSeleccionada);
          break;
        default:
          break;
      }

    },
    async totalActivos(tipoReporte) {
      // Obtener el total de activos por departamento
      try {
        const response = await axios.get(`http://localhost:3000/api/reportes/totalActivosPorDepto`);
        this.totalActPorDepartamento = response.data;
        console.log('Total activos por departamento', this.totalActPorDepartamento);
      } catch (error) {
        console.error('Error al obtener total activos por departamento', error);
        throw error;
      }

      // Generar el reporte
      switch (tipoReporte) {
        case 1:
          this.generarPDF(this.totalActPorDepartamento, 2, 0, 0);
          break;
        case 2:
          this.generarCSV(this.totalActPorDepartamento, 2, 0, 0);
          break;
        default:
          break;
      }

    },
    async activosPorDepartamento(tipoReporte) {
      // Validar que se haya seleccionado un departamento
      const depclave = this.actDepto;
      if (!depclave) {
        this.alertaToast('warning', 'Selecciona un departamento antes de generar el reporte.');
        return;
      }

      // Toma el nombre del departamento seleccionado
      const departamentoSeleccionado = this.departamentos.find(depto => depto.depclave === depclave);
      const depdeptoSeleccionado = departamentoSeleccionado.depdepto;

      // Obtener los activos por departamento
      try {
        const response = await axios.get(`http://localhost:3000/api/reportes/activosPorDepto/${depclave}`);
        this.actPorDepartamento = response.data;
        console.log('Activos por departamento', this.actPorDepartamento);
      } catch (error) {
        console.error('Error al obtener activos por departamento', error);
        throw error;
      }

      // Generar el reporte
      switch (tipoReporte) {
        case 1:
          this.generarPDF(this.actPorDepartamento, 1, depdeptoSeleccionado, 0);
          break;
        case 2:
          this.generarCSV(this.actPorDepartamento, 1, depdeptoSeleccionado, 0);
          break;
        default:
          break;
      }

    },
    generarPDF(data, tipoReporte, depdepto, fechaSeleccionada) {
      if (!data || data.length === 0) {
        this.alertaToast('warning', 'No hay datos para generar el PDF.');
        return;
      }

      switch (tipoReporte) {
        case 1:
          // Reporte de Activos por departamento
          const pdf1 = new jsPDF({
            orientation: 'landscape',
          });
          const pageTitle1 = 'Reporte de activos por departamento - ' + depdepto;
          const headers1 = [['ID', 'Nombre activo', 'Características', 'Marca', 'Modelo', 'Camb', 'Departamento', 'Nombre jefe', 'Nombre área', 'Fecha alta']];
          pdf1.text(pageTitle1, 14, 20);
          pdf1.autoTable({
            head: headers1,
            body: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.ActMarca, item.ActModelo, item.ActCabm, item.depdepto, item.jefenombre, item.areanombre, item.FechaAlta]),
            startY: 30,
          });
          pdf1.save(`reporte_activos_por_departamento_${new Date().toISOString()}.pdf`);
          break;

        case 2:
          // Reporte de total de activos por departamento
          const pdf2 = new jsPDF();
          const pageTitle2 = 'Reporte de total de activos agrupado por departamento';
          const headers2 = [['Departamento', 'Total de activos']];
          pdf2.text(pageTitle2, 14, 20);
          pdf2.autoTable({
            head: headers2,
            body: data.map(item => [item.depdepto, item.activos]),
            startY: 30,
          });
          pdf2.save(`reporte_total_activos_por_departamento_${new Date().toISOString()}.pdf`);
          break;

        case 3:
          // Reporte de inventario por departamento y fecha
          const pdf3 = new jsPDF({
            orientation: 'landscape',
          });
          const pageTitle3 = 'Reporte de inventario - ' + depdepto + ' - ' + fechaSeleccionada;

          if (this.detalleReporte) {
            const headers3 = [['Nombre del área', 'Activos registrados', 'Activos escaneados']];
            pdf3.text(pageTitle3, 14, 20);

            pdf3.autoTable({
              head: headers3,
              body: data.map(item => [item.areanombre, item.activos, item.escaneado]),
              startY: 30,
            });
            pdf3.save(`reporte_inventario_conteo_${new Date().toISOString()}.pdf`);
          } else {
            const headers3 = [['ID', 'Nombre activo', 'Características', 'Departamento', 'Nombre área', 'Estado']];
            pdf3.text(pageTitle3, 14, 20);

            pdf3.autoTable({
              head: headers3,
              body: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.depdepto, item.areanombre, item.EstadoEscaneo]),
              startY: 30,
            });
            pdf3.save(`reporte_inventario_detalle_${new Date().toISOString()}.pdf`);
          }

          break;

        case 4:
          // Reporte de impresiones por departamento
          const pdf4 = new jsPDF({
            orientation: 'landscape',
          });
          const pageTitle4 = 'Reporte de impresiones por departamento - ' + depdepto;
          const headers4 = [['ID', 'Nombre activo', 'Características', 'Departmento', 'Nombre del área', 'Conteo impresiones']];
          pdf4.text(pageTitle4, 14, 20);
          pdf4.autoTable({
            head: headers4,
            body: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.depdepto, item.areanombre, item.CantidadImpresiones]),
            startY: 30,
          });
          pdf4.save(`reporte_impresiones_por_departamento_${new Date().toISOString()}.pdf`);
          break;
      }

    },
    generarCSV(data, tipoReporte, depdepto) {
      if (!data || data.length === 0) {
        this.alertaToast('warning', 'No hay datos para generar el CSV.');
        return;
      }

      switch (tipoReporte) {
        case 1:
          // Reporte de Activos por departamento
          const csv1 = Papa.unparse({
            fields: ['ID', 'Nombre activo', 'Caracteristicas', 'Marca', 'Modelo', 'Camb', 'Departamento', 'Nombre jefe', 'Nombre area', 'Fecha alta'],
            data: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.ActMarca, item.ActModelo, item.ActCabm, item.depdepto, item.jefenombre, item.areanombre, item.FechaAlta]),
          });

          this.descargarArchivoCSV(csv1, `reporte_activos_por_departamento_${new Date().toISOString()}.csv`);
          break;

        case 2:
          // Reporte de total de activos por departamento
          const csv2 = Papa.unparse({
            fields: ['Departamento', 'Total de activos'],
            data: data.map(item => [item.depdepto, item.activos]),
          });

          this.descargarArchivoCSV(csv2, `reporte_total_activos_por_departamento_${new Date().toISOString()}.csv`);
          break;

        case 3:
          // Reporte de inventario por departamento y fecha
          if (this.detalleReporte) {
            const csv3 = Papa.unparse({
              fields: ['Nombre del area', 'Activos registrados', 'Activos escaneados'],
              data: data.map(item => [item.areanombre, item.activos, item.escaneado]),
            });
            this.descargarArchivoCSV(csv3, `reporte_inventario_conteo_${new Date().toISOString()}.csv`);
          } else {
            const csv3 = Papa.unparse({
              fields: ['ID', 'Nombre activo', 'Características', 'Departamento', 'Nombre área', 'Estado'],
              data: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.depdepto, item.areanombre, item.EstadoEscaneo]),
            });
            this.descargarArchivoCSV(csv3, `reporte_inventario_detalle_${new Date().toISOString()}.csv`);
          }

          break;

        case 4:
          // Reporte de impresiones por departamento
          const csv4 = Papa.unparse({
            fields: ['ID', 'Nombre activo', 'Caracteristicas', 'Departmento', 'Nombre del area', 'Conteo impresiones'],
            data: data.map(item => [item.ActId, item.ActNombre, item.ActCaracteristicas, item.depdepto, item.areanombre, item.CantidadImpresiones]),
          });
          this.descargarArchivoCSV(csv4, `reporte_impresiones_por_departamento_${new Date().toISOString()}.csv`);
          break;
      }
    },

    descargarArchivoCSV(csvData, filename) {
      // Crear un Blob con el contenido CSV
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

      // Crear un objeto URL para el Blob
      const csvURL = window.URL.createObjectURL(blob);

      // Crear un enlace invisible para descargar el archivo CSV
      const link = document.createElement('a');
      link.href = csvURL;
      link.setAttribute('download', filename);
      document.body.appendChild(link);

      // Hacer clic en el enlace para iniciar la descarga
      link.click();

      // Eliminar el enlace del documento
      document.body.removeChild(link);
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
    },
  },
  created() {
    this.detalleReporte = true;
    // Obtener la lista de departamentos
    axios.get('http://localhost:3000/api/combo/departments')
      .then(response => {
        this.departamentos = response.data;
      })
      .catch(error => {
        console.error('Error al cargar la lista de departamentos', error);
      });
  },
};
</script>

<style>
.report-box {
  border: 1px solid #ccc;
  padding: 20px;
  text-align: center;
  margin: 10px;
}

.entrar {
  animation: entrada 0.7s ease;
}

.v-btn {
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: auto;
}


@keyframes entrada {
  from {
    opacity: 0;
  }

  to {
    opacity: 100%;
  }
}

@keyframes entrada {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
