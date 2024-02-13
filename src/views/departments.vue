<template>
    <div class="container mt-2 entrar">
        <!-- <h1 class="text-center">Administración de departamentos</h1> -->

        <v-tabs v-model="currentTab" color="deep-purple-accent-4" align-tabs="center">
            <v-tab v-for="(tab, index) in tabs" :key="index">
                {{ tab }}
            </v-tab>

            <v-tab-item v-for="(tab, index) in tabs" :key="index">
                <v-card>
                    <v-card-text>
                        <div v-if="index === 0">
                            <!-- Sección de departamentos -->
                            <h2 class="text-center">Departamentos</h2>
                            <v-btn @click="registroDeptos" class="mb-3 green btnagregar" dark>
                                <v-icon>mdi-plus</v-icon> Agregar departamento
                            </v-btn>
                            <v-text-field v-model="searchDepartment" label="Buscar departamento" append-icon="mdi-magnify"
                                class="mb-3"></v-text-field>
                            <v-data-table :headers="departmentHeaders" :items="filteredDepartments" class="elevation-1">
                                <template v-slot:item="{ item }">
                                    <tr>
                                        <td>{{ item.ID }}</td>
                                        <td>{{ item.Departamento }}</td>
                                        <td>{{ item.NombreEncargado }}</td>
                                        <td>
                                            <v-btn @click="editarDepartamento(item.ID)" class="ma-1 orange darken-1" fab
                                                dark small>
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn @click="confirmaEliminarElemento(item.ID, 1)" class="ma-1 red" fab dark
                                                small>
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>

                        <div v-else-if="index === 1">
                            <!-- Sección de jefes de departamento -->
                            <h2 class="text-center">Jefes de departamento / área</h2>
                            <v-btn @click="registroJefes" class="mb-3 green btnagregar" dark>
                                <v-icon>mdi-plus</v-icon> Agregar jefe
                            </v-btn>
                            <v-text-field v-model="searchJefe" label="Buscar jefe de departamento / área"
                                append-icon="mdi-magnify" class="mb-3"></v-text-field>
                            <v-data-table :headers="JefesHeaders" :items="filteredJefes" class="elevation-1">
                                <template v-slot:item="{ item }">
                                    <tr>
                                        <td>{{ item.jefeid }}</td>
                                        <td>{{ item.jefenombre }}</td>
                                        <td>{{ item.departamento }}</td>
                                        <td>{{ item.jefetipo_desc }}</td>
                                        <td>
                                            <v-btn @click="editarJefe(item.jefeid)" class="ma-1 orange darken-1" fab dark
                                                small>
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn @click="confirmaEliminarElemento(item.jefeid, 2)" class="ma-1 red" fab
                                                dark small>
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>

                        <div v-else-if="index === 2">
                            <!-- Sección de áreas -->
                            <h2 class="text-center">Áreas</h2>
                            <v-btn @click="registroAreas" class="mb-3 green btnagregar" dark>
                                <v-icon>mdi-plus</v-icon> Agregar área
                            </v-btn>
                            <v-text-field v-model="searchArea" label="Buscar área" append-icon="mdi-magnify"
                                class="mb-3"></v-text-field>
                            <v-data-table :headers="areaHeaders" :items="filteredAreas" class="elevation-1">
                                <template v-slot:item="{ item }">
                                    <tr>
                                        <td>{{ item.areaid }}</td>
                                        <td>{{ item.areanombre }}</td>
                                        <td>{{ item.jefenombre }}</td>
                                        <td>{{ item.depdepto }}</td>
                                        <td>
                                            <v-btn @click="editarArea(item.areaid)" class="ma-1 orange darken-1" fab dark
                                                small>
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn @click="confirmaEliminarElemento(item.areaid, 3)" class="ma-1 red" fab
                                                dark small>
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </div>
                    </v-card-text>
                </v-card>
            </v-tab-item>
        </v-tabs>

        <!-- Modal para agregar departamentos -->
        <v-dialog v-model="mostrarModalDepto" max-width="500">
            <v-card>
                <v-card-title>
                    {{ modoEdicion ? 'Editar departamento' : 'Registrar departamento' }}
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="nuevoDepartamento.depdepto" label="Departamento*" outlined
                        :error="nuevoDepartamentoErrores.depdepto" @input="toUpper"></v-text-field>
                    <v-text-field v-model="nuevoDepartamento.depalias" label="Alias del Departamento*" outlined
                        :error="nuevoDepartamentoErrores.depalias" @input="toUpper"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" @click="modoEdicion ? guardarCambiosDepto() : agregarDepartamento()">
                        {{ modoEdicion ? 'Guardar cambios' : 'Agregar departamento' }}
                    </v-btn>
                    <v-btn color="red darken-1" @click="mostrarModalDepto = false">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Modal para agregar jefes de departamento -->
        <v-dialog v-model="mostrarModalJefes" max-width="500">
            <v-card>
                <v-card-title>
                    {{ modoEdicion ? 'Editar jefe de departamento / área' : 'Agregar jefe de departamento / área' }}
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="nuevoJefe.jefenombre" label="Nombre del Jefe" outlined
                        :error="nuevoJefeErrores.jefenombre" @input="toUpper"></v-text-field>
                    <v-autocomplete v-model="nuevoJefe.departamento" :items="departamentos" label="Departamento"
                        item-text="depdepto" item-value="depclave" outlined
                        :error="nuevoJefeErrores.departamento"></v-autocomplete>
                    <v-radio-group v-model="nuevoJefe.jefetipo_desc" row :error="nuevoJefeErrores.jefetipo_desc">
                        <v-radio label="Jefe de Departamento" :value="true"></v-radio>
                        <v-radio label="Jefe de Área" :value="false"></v-radio>
                    </v-radio-group>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" @click="modoEdicion ? guardarCambiosJefe() : agregarJefe()">
                        {{ modoEdicion ? 'Guardar cambios' : 'Agregar jefe' }}
                    </v-btn>
                    <v-btn color="red darken-1" @click="mostrarModalJefes = false">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Modal para agregar áreas -->
        <v-dialog v-model="mostrarModalAreas" max-width="500">
            <v-card>
                <v-card-title>
                    {{ modoEdicion ? 'Editar Área' : 'Agregar Área' }}
                </v-card-title>
                <v-card-text>
                    <v-autocomplete v-model="nuevaArea.depdepto" :items="departamentos" label="Seleccionar Departamento"
                        item-text="depdepto" item-value="depclave" outlined :error="nuevaAreaErrores.depdepto"
                        @input="filtrarJefesPorDepartamento"></v-autocomplete>
                    <v-autocomplete v-model="nuevaArea.jefenombre" :items="managerOptions"
                        label="Seleccionar Encargado del Área" item-text="jefenombre" item-value="jefeid" outlined
                        :error="nuevaAreaErrores.jefenombre"></v-autocomplete>
                    <v-text-field v-model="nuevaArea.areanombre" label="Nombre del Área" outlined
                        :error="nuevaAreaErrores.areanombre" @input="toUpper"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue darken-1" @click="modoEdicion ? guardarCambiosArea() : agregarArea()">
                        {{ modoEdicion ? 'Guardar cambios' : 'Agregar área' }}
                    </v-btn>
                    <v-btn color="red darken-1" @click="mostrarModalAreas = false">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Modal para confirmar la eliminación de un elemento -->
        <v-dialog v-model="mostrarConfirmacionEliminar" max-width="400">
            <v-card>
                <v-card-title class="headline">Confirmar eliminación</v-card-title>
                <v-card-text>
                    <div v-if="elementoAEliminar">
                        ¿Estás seguro de que deseas eliminar el elemento con el ID "{{ elementoEliminar.elementoNombre
                        }}"?
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="mostrarConfirmacionEliminar = false;">Cancelar</v-btn>
                    <v-btn @click="eliminarElementoSQL" color="red" dark>Eliminar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import axios from 'axios';
import Swal from "sweetalert2";

export default {
    name: 'departments',
    data: () => ({
        currentTab: 0,
        tabs: ['Departamentos', 'Jefes de departamento', 'Áreas'],
        departmentHeaders: [
            { text: 'ID', value: 'ID' },
            { text: 'Departamento', value: 'Departamento' },
            { text: 'Encargado', value: 'NombreEncargado' },
            { text: 'Acciones', value: 'actions' },
        ],
        JefesHeaders: [
            { text: 'ID', value: 'jefeid' },
            { text: 'Nombre', value: 'jefenombre' },
            { text: 'Departamento', value: 'departamento' },
            { text: 'Rol', value: 'jefetipo_desc' },
            { text: 'Acciones', value: 'actions' },
        ],
        areaHeaders: [
            { text: 'ID', value: 'areaid' },
            { text: 'Área', value: 'areanombre' },
            { text: 'Encargado área', value: 'jefenombre' },
            { text: 'Departamento', value: 'depdepto' },
            { text: 'Acciones', value: 'actions' },
        ],
        searchDepartment: '',
        searchJefe: '',
        searchArea: '',
        mostrarModalDepto: false,
        mostrarModalJefes: false,
        mostrarModalAreas: false,
        elementoAEliminar: false,
        tipoDataTable: 0,
        elementoEliminar: {
            elementoNombre: '',
        },
        nuevoDepartamento: {
            depdepto: '',
            depalias: '',
            nombreEncargado: '',
        },
        nuevoDepartamentoErrores: {
            depdepto: false,
            depalias: false,
        },
        nuevoJefe: {
            jefenombre: '',
            departamento: '',
            jefetipo_desc: '',
            depclave: '',
        },
        nuevoJefeErrores: {
            jefenombre: false,
            departamento: false,
            jefetipo_desc: false,
        },
        nuevaArea: {
            areaid: '',
            areanombre: '',
            jefenombre: '',
            jefeid: '',
            depdepto: '',
        },
        nuevaAreaErrores: {
            areaid: false,
            areanombre: false,
            jefenombre: false,
            depdepto: false,
        },
        departments: [],
        departamentos: [],
        jefes: [],
        jefesCombo: [],
        areas: [],
        jefesPorDepartamento: [],
        managerOptions: [],
        departmentOptions: [],
        edicionActivaDepto: false,
        modoEdicion: false,
        mostrarConfirmacionEliminar: false,

    }),
    computed: {
        filteredDepartments() {
            return this.departments.filter((department) => {
                const searchTerm = this.searchDepartment.toLowerCase();
                for (const key in department) {
                    if (department[key] && department[key].toString().toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            });
        },
        filteredJefes() {
            return this.jefes.filter((jefe) => {
                const searchTerm = this.searchJefe.toLowerCase();
                for (const key in jefe) {
                    if (jefe[key] && jefe[key].toString().toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            });
        },
        filteredAreas() {
            return this.areas.filter((area) => {
                const searchTerm = this.searchArea.toLowerCase();
                for (const key in area) {
                    if (area[key] && area[key].toString().toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            });
        },
    },
    methods: {
        toUpper() {
            this.nuevoDepartamento.depdepto = this.nuevoDepartamento.depdepto.toUpperCase();
            this.nuevoDepartamento.depalias = this.nuevoDepartamento.depalias.toUpperCase();
            this.nuevoJefe.jefenombre = this.nuevoJefe.jefenombre.toUpperCase();
            this.nuevaArea.areanombre = this.nuevaArea.areanombre.toUpperCase();
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
        eliminarElementoSQL() {
            switch (this.tipoDataTable) {
                case 1:
                    axios
                        .delete(`http://localhost:3000/api/departments/eliminar/${this.elementoEliminar.elementoNombre}`)
                        .then((response) => {
                            this.alertaToast("success", "Departamento eliminado");

                            // Elimina el activo de la lista
                            const index = this.departamentos.findIndex((item) => item.depclave === this.elementoEliminar.elementoNombre);
                            if (index !== -1) {
                                this.departamentos.splice(index, 1);
                            }
                            this.cargaDatosCombos();
                            this.cargaDatosDeptos();
                        })
                        .catch((error) => {
                            this.alertaToast("warning", "No se puede eliminar el elemento seleccionado. Se encuentra relacionado en otra tabla.");
                            console.error('Error al eliminar el elemento:', error);
                        });
                    break;
                case 2:
                    axios
                        .delete(`http://localhost:3000/api/jefes/eliminar/${this.elementoEliminar.elementoNombre}`)
                        .then((response) => {
                            this.alertaToast("success", "Jefe eliminado");

                            // Elimina el activo de la lista
                            const index = this.jefes.findIndex((item) => item.jefeid === this.elementoEliminar.elementoNombre);
                            if (index !== -1) {
                                this.jefes.splice(index, 1);
                            }
                            this.cargaDatosDeptos();
                        })
                        .catch((error) => {
                            this.alertaToast("warning", "No se puede eliminar el elemento seleccionado. Se encuentra relacionado en otra tabla.");
                            console.error('Error al eliminar el elemento:', error);
                        });
                    break;
                case 3:
                    axios
                        .delete(`http://localhost:3000/api/areas/eliminar/${this.elementoEliminar.elementoNombre}`)
                        .then((response) => {
                            this.alertaToast("success", "Área eliminada");

                            // Elimina el activo de la lista
                            const index = this.areas.findIndex((item) => item.areaid === this.elementoEliminar.elementoNombre);
                            if (index !== -1) {
                                this.areas.splice(index, 1);
                            }
                        })
                        .catch((error) => {
                            this.alertaToast("warning", "No se puede eliminar el elemento seleccionado. Se encuentra relacionado en otra tabla.");
                            console.error('Error al eliminar el elemento:', error);
                        });
                    break;
            }
            this.mostrarConfirmacionEliminar = false;
        },
        confirmaEliminarElemento(id, tipo) {
            // Obtén el activo a eliminar por su ActId
            this.tipoDataTable = tipo;
            this.elementoEliminar.elementoNombre = id;
            this.elementoAEliminar = true;
            this.mostrarConfirmacionEliminar = true; // Muestra el cuadro de diálogo de confirmación

        },
        registroDeptos() {
            this.nuevoDepartamento = {
                depdepto: '',
                depalias: '',
                nombreEncargado: ''
            }
            this.modoEdicion = false;
            this.mostrarModalDepto = true;

        },
        registroJefes() {
            this.nuevoJefe = {
                jefenombre: '',
                departamento: '',
                jefetipo_desc: false,
            }
            this.modoEdicion = false;
            this.mostrarModalJefes = true;

        },
        registroAreas() {
            this.nuevaArea = {
                areaid: '',
                areanombre: '',
                jefenombre: '',
                depdepto: '',
            },
                this.modoEdicion = false;
            this.mostrarModalAreas = true;

        },
        guardarCambiosDepto() {
            axios
                .put(`http://localhost:3000/api/departments/setDepto/${this.idDeptoEditar}`, this.nuevoDepartamento)
                .then((response) => {
                    this.alertaToast("success", "Departamento actualizado con éxito.");

                    // Actualiza el departamento en la lista
                    const index = this.departamentos.findIndex((item) => item.depclave === this.idDeptoEditar);
                    if (index !== -1) {
                        this.departamentos[index] = this.nuevoDepartamento;
                    }
                    this.cargaDatosDeptos();
                    this.mostrarModalDepto = false;

                })
                .catch((error) => {
                    this.alertaToast("error", "Error al editar depto: " + error);
                });
        },
        guardarCambiosJefe() {
            axios
                .put(`http://localhost:3000/api/departments/setJefe/${this.idJefeEditar}`, this.nuevoJefe)
                .then((response) => {
                    this.alertaToast("success", "Jefe actualizado con éxito.");

                    // Actualiza el departamento en la lista
                    const index = this.jefes.findIndex((item) => item.jefeid === this.idJefeEditar);
                    if (index !== -1) {
                        this.jefes[index] = this.nuevoJefe;
                    }
                    this.cargaDatosJefes();
                    this.cargaDatosDeptos();
                    this.cargaDatosAreas();
                    this.mostrarModalJefes = false;

                })
                .catch((error) => {
                    this.alertaToast("error", "Error al editar jefe: " + error);
                });
        },
        guardarCambiosArea() {
            axios
                .put(`http://localhost:3000/api/departments/setArea/${this.idAreaEditar}`, this.nuevaArea)
                .then((response) => {
                    this.alertaToast("success", "Área actualizada con éxito.");

                    // Actualiza el departamento en la lista
                    const index = this.areas.findIndex((item) => item.areaid === this.idAreaEditar);
                    if (index !== -1) {
                        this.areas[index] = this.nuevaArea;
                    }
                    this.cargaDatosAreas();
                    this.mostrarModalAreas = false;

                })
                .catch((error) => {
                    this.alertaToast("error", "Error al editar area: " + error);
                });
        },
        async filtrarJefesPorDepartamento() {
            const depto = this.nuevaArea.depdepto.depclave === undefined ?
                this.nuevaArea.depdepto :
                this.nuevaArea.depdepto.depclave;

            if (this.nuevaArea.depdepto) {
                this.managerOptions = this.jefesCombo.filter(jefe => jefe.depclave === depto);
            }
        },
        editarArea(id) {
            this.idAreaEditar = id;
            this.cargarAreaPorId(id);
            this.modoEdicion = true;
            this.mostrarModalAreas = true;
        },
        editarJefe(id) {
            this.idJefeEditar = id;
            this.cargarJefePorId(id);
            this.modoEdicion = true;
            this.mostrarModalJefes = true;
        },
        editarDepartamento(id) {
            this.idDeptoEditar = id;
            this.cargarDepartamentoPorId(id);
            this.modoEdicion = true;
            this.mostrarModalDepto = true;
        },
        cargarDepartamentoPorId(depClave) {
            axios
                .get(`http://localhost:3000/api/departments/${depClave}`)
                .then((response) => {

                    // Carga los datos del activo en el formulario
                    this.nuevoDepartamento.depdepto = response.data[0].Depdepto;
                    this.nuevoDepartamento.depalias = response.data[0].Depalias;
                    this.nuevoDepartamento.nombreEncargado = response.data[0].nombreEncargado;

                    // Activa el modo de edición y muestra el formulario
                    this.edicionActiva = true;
                    this.mostrarFormulario = true;
                })
                .catch((error) => {
                    console.error('Error al cargar los datos del activo:', error);
                });
        },
        cargarJefePorId(jefeid) {
            axios
                .get(`http://localhost:3000/api/jefes/${jefeid}`)
                .then((response) => {

                    // Carga los datos del activo en el formulario
                    this.nuevoJefe.jefeid = response.data[0].jefeid;
                    this.nuevoJefe.jefenombre = response.data[0].jefenombre;
                    this.nuevoJefe.departamento = response.data[0].departamento;
                    this.nuevoJefe.depclave = response.data[0].depclave;
                    this.nuevoJefe.jefetipo_desc = response.data[0].jefetipo;

                    // Buscar el departamento correspondiente en la lista de departamentos
                    const departamentoSeleccionado = this.departamentos.find(
                        (departamento) => departamento.depclave === response.data[0].depclave
                    );

                    this.nuevoJefe.departamento = departamentoSeleccionado || null;

                    // Activa el modo de edición y muestra el formulario
                    this.edicionActiva = true;
                    this.mostrarFormulario = true;
                })
                .catch((error) => {
                    console.error('Error al cargar los datos del activo:', error);
                });
        },
        cargarAreaPorId(depClave) {
            axios
                .get(`http://localhost:3000/api/areas/${depClave}`)
                .then(async (response) => {

                    // Carga los datos del activo en el formulario
                    this.nuevaArea.areaid = response.data[0].areaid;
                    this.nuevaArea.areanombre = response.data[0].areanombre;

                    // Buscar el departamento correspondiente en la lista de departamentos
                    const departamentoSeleccionado = this.departamentos.find(
                        (departamento) => departamento.depclave === response.data[0].depclave
                    );

                    const encargado = this.jefesCombo.find(
                        (jefe) => jefe.jefeid === response.data[0].jefeid
                    );

                    this.nuevaArea.depdepto = departamentoSeleccionado || null;
                    this.nuevaArea.jefenombre = encargado || null;

                    await this.filtrarJefesPorDepartamento();

                    // Activa el modo de edición y muestra el formulario
                    this.edicionActiva = true;
                    this.mostrarFormulario = true;
                })
                .catch((error) => {
                    console.error('Error al cargar los datos del activo:', error);
                });
        },
        agregarDepartamento() {
            this.nuevoDepartamentoErrores = {
                depdepto: false,
                depalias: false
            };

            if (!this.nuevoDepartamento.depdepto || !this.nuevoDepartamento.depalias) {
                if (!this.nuevoDepartamento.depdepto) {
                    this.nuevoDepartamentoErrores.depdepto = true;
                }

                if (!this.nuevoDepartamento.depalias) {
                    this.nuevoDepartamentoErrores.depalias = true;
                }
                return;
            }

            axios
                .post('http://localhost:3000/api/departments/registraDepto', this.nuevoDepartamento)
                .then((response) => {
                    this.alertaToast("success", "Departamento registrado.");
                    this.nuevoDepartamento = {
                        depdepto: '',
                        depalias: ''
                    };
                    this.cargaDatosDeptos();
                    this.cargaDatosCombos();
                })
                .catch((error) => {
                    this.alertaToast("error", "Error al registrar depto: " + error);
                });

            this.nuevoDepartamento.depdepto = '';
            this.nuevoDepartamento.depalias = '';
            this.mostrarModalDepto = false;
        },

        agregarJefe() {
            this.nuevoJefeErrores = {
                jefeNombre: false,
                jefetipo_desc: false,
                departamento: false
            };

            if (!this.nuevoJefe.jefenombre || !this.nuevoJefe.departamento) {

                if (!this.nuevoJefe.jefenombre) {
                    this.nuevoJefeErrores.jefenombre = true;
                }

                if (!this.nuevoJefe.departamento) {
                    this.nuevoJefeErrores.departamento = true;
                }
                return;
            }

            axios
                .post('http://localhost:3000/api/jefes/registraJefe', this.nuevoJefe)
                .then((response) => {
                    this.alertaToast("success", "Jefe registrado.");
                    this.nuevoJefe = {
                        jefeNombre: '',
                        jefetipo_desc: '',
                        departamento: ''
                    };
                    this.cargaDatosJefes();
                    this.cargaDatosAreas();
                    this.cargaDatosDeptos();
                    this.cargaDatosCombos();
                })
                .catch((error) => {
                    this.alertaToast("error", "Error al registrar jefe: " + error);
                });

            this.nuevoJefe.jefenombre = '';
            this.nuevoJefe.departamento = '';
            this.mostrarModalJefes = false;
        },

        agregarArea() {
            this.nuevaAreaErrores = {
                areaid: false,
                areanombre: false,
                jefenombre: false,
                depdepto: false,
            };

            if (!this.nuevaArea.areanombre || !this.nuevaArea.jefenombre || !this.nuevaArea.depdepto) {

                if (!this.nuevaArea.areanombre) {
                    this.nuevaAreaErrores.areanombre = true;
                }

                if (!this.nuevaArea.jefenombre) {
                    this.nuevaAreaErrores.jefenombre = true;
                }

                if (!this.nuevaArea.depdepto) {
                    this.nuevaAreaErrores.depdepto = true;
                }

                return;
            }

            axios
                .post('http://localhost:3000/api/areas/registraArea', this.nuevaArea)
                .then((response) => {
                    this.alertaToast("success", "Área registrada.");
                    this.cargaDatosAreas();
                    this.nuevaArea = {
                        areaid: '',
                        areanombre: '',
                        jefenombre: '',
                        depdepto: '',
                    };
                })
                .catch((error) => {
                    this.alertaToast("error", "Error al registrar area: " + error);
                });

            this.managerOptions = this.jefesCombo;
            this.nuevaArea.areanombre = '';
            this.nuevaArea.jefenombre = '';
            this.nuevaArea.depdepto = '';
            this.mostrarModalAreas = false;
        },
        cargaDatosDeptos() {
            axios.get('http://localhost:3000/api/departments')
                .then(response => {
                    this.departments = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar departments', error);
                });
        },
        cargaDatosJefes() {
            axios.get('http://localhost:3000/api/jefes')
                .then(response => {
                    this.jefes = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar jefes', error);
                });
        },
        cargaDatosAreas() {
            axios.get('http://localhost:3000/api/areas')
                .then(response => {
                    this.areas = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar areas', error);
                });
        },
        cargaDatosCombos() {
            // Combo deptos
            axios.get('http://localhost:3000/api/combo/departments')
                .then(response => {
                    this.departamentos = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar la lista de departamentos', error);
                });

            // Combo de jefes
            axios.get('http://localhost:3000/api/combo/jefes')
                .then(response => {
                    this.jefesCombo = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar la lista de jefes', error);
                });
        },
    },
    created() {
        // Jefe area seleccionado por default.
        this.nuevoJefe.jefetipo_desc = false;

        // DataTable de departamentos
        this.cargaDatosDeptos();

        // DataTable de jefes
        this.cargaDatosJefes();

        // DataTable de areas
        this.cargaDatosAreas();

        // Combos
        this.cargaDatosCombos();


    },
};
</script>
  
<style>
.btnagregar {
    margin-top: 15px;

}

.entrar {
    animation: entrada 0.7s ease;
}

@media (max-width: 960px) {

    .btnagregardepart {
        margin-top: 53.5px;
    }
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