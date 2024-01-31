<template>
  <v-app>
    <v-app-bar v-if="!inicioSesion" app color="background" dark>
      <v-img :src="require('../src/assets/teclogo.png')" class="shrink mr-2" width="75" />
      <span class="nombreP">InvenTec</span>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" text>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path>
            </svg>
          </v-btn>
        </template>
        <v-list>

          <v-list-item v-for="item in menuItems" :key="item.value">
            <router-link :to="item.value">
              <v-btn text>
                <v-icon>{{ item.icon }}</v-icon>
                {{ item.title }}
              </v-btn>
            </router-link>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      inicioSesion: false,
      menuItems: [
        { title: 'Inicio', icon: 'mdi-home', value: '/home' },
        { title: 'Usuarios', icon: 'mdi-account', value: '/users' },
        { title: 'Inventarios', icon: 'mdi-archive', value: '/inventory' },
        { title: 'Departamentos', icon: 'mdi-account-multiple', value: '/departments' },
        { title: 'Reportes', icon: 'mdi-file-chart', value: '/reports' },
        { title: 'Vales de resguardo', icon: 'mdi-receipt', value: '/valesResguardo' },
        { title: 'Cerrar sesión', icon: 'mdi-logout', value: '/' }
      ]
    };
  },
  watch: {
    $route(to) {
      this.inicioSesion = to.path === '/'; // Verifica si la ruta es la ventana de inicio de sesión
    }
  }
};
</script>

<style>
.nombreP {
  color: rgb(255, 255, 255);
  padding-top: 1px;
  font-size: 200%;

}</style>
