import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import login from '../views/login.vue'
import users from '../views/users.vue'
import inventory from '../views/inventory.vue'
import departments from '../views/departments.vue'
import reports from '../views/reports.vue'
import valesResguardo from '../views/valesResguardo.vue'
import Swal from "sweetalert2";
import axios from 'axios';
import {
  getAuth,
  signOut
} from "firebase/auth";
let UsrTipo = 0;

Vue.use(VueRouter);

const routes = [{
    path: '/',
    name: 'login',
    component: login
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/users',
    name: 'users',
    component: users,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: inventory,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/departments',
    name: 'departments',
    component: departments,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/reports',
    name: 'reports',
    component: reports,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/valesResguardo',
    name: 'valesResguardo',
    component: valesResguardo,
    meta: {
      requiresAuth: true
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// Middleware para verificar la autenticación y el rol de administrador
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // La ruta requiere autenticación
    if (!auth.currentUser) {
      // El usuario no está autenticado
      alertaToast("warning", "Debes iniciar sesión.");
      next({
        name: 'login'
      });
    } else {
      // El usuario está autenticado

      // Obtener información del usuario desde tu base de datos SQL
      obtenTipoUsrSQL(auth.currentUser.email);
   
      // Verificar si el usuario es administrador
      //if (to.matched.some((record) => record.meta.requiresAdmin)) {
        // La ruta requiere ser administrador, pero el usuario no es administrador
     //   alertaToast("warning", "Acceso no autorizado.");
    //    next({
     //     name: 'reports'
    //    }); // Redirigir a una página adecuada para no administradores
     // } else {
        // El usuario es administrador o la ruta no requiere ser administrador
        next();
     // }
    }
  } else if (to.name === 'login' && from.name !== 'login') {
    // El usuario está yendo a la vista de inicio de sesión desde otra vista
    // Cerrar la sesión
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar la sesión:", error);
    }
    next();
  } else {
    next();
  }
});

function obtenTipoUsrSQL(correoElectronico) {
  axios
    .get(`http://localhost:8080/api/users/validaTipo/${correoElectronico}`)
    .then((response) => {
      UsrTipo = response.data[0].UsrTipo;

    })
    .catch((error) => {
      console.error('Error al cargar los datos del usuario:', error);
    });
}

const alertaToast = (icono, titulo) => {
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
};

export default router;