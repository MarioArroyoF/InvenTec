<template>
    <div class="login-container">
        <div class="login-content">
            <div class="col-12 text-center mb-4">
                <h1>Iniciar sesión</h1>
            </div>
            <div class="col-sm-5 m-auto">
                <div v-if="errorMessage !== ''" class="alert alert-danger" role="alert">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage !== ''" class="alert alert-success" role="alert">
                    {{ successMessage }}
                </div>
                <form @submit.prevent="loginRequest" id="login-form">
                    <div class="row text-left">
                        <div class="col-sm-12 form-group">
                            <v-text-field color="primary" label="Correo Electronico" variant="outlined" type="email"
                                v-model="email" id="email"></v-text-field>
                        </div>
                        <div class=" col-sm-12 form-group">
                            <v-text-field color="primary" label="Contraseña" variant="outlined" type="password"
                                v-model="password" id="password" hint="Ingrese su Contraseña"></v-text-field>
                        </div>
                        <div class="col-sm-12 text-center form-group">
                            <button v-bind:disabled="xhrRequest" v-bind:class="{ disabled: xhrRequest }"
                                class="btn btn-lg btn-primary px-4">
                                <span v-if="!xhrRequest">Iniciar sesión</span>
                                <span v-if="xhrRequest">Por favor espere...</span>
                            </button>
                            <div v-if="xhrRequest" class="spinner-border text-secondary loader" role="status">
                                <span class="sr-only">Cargando...</span>
                            </div>
                        </div>
                    </div>
                </form>
                <v-divider :thickness="4" class="border-opacity-100"></v-divider>
                <div class="col-sm-12 text-center form-group mt-5">
                    <p>¿Olvidaste tu contraseña?</p>
                    <!--Boton-->
                    <div class="boton-modal">
                        <label for="btn-modal">
                            Recuperar
                        </label>
                    </div>
                    <!--Fin de Boton-->

                    <!--Ventana Modal-->
                    <input type="checkbox" id="btn-modal" />
                    <div class="container-modal">
                        <form @submit.prevent="cambiarContrasena" id="login-form-recuperar">
                            <div class="content-modal">
                                <h2>Recuperar contraseña</h2>
                                <div class="col-sm-14 form-group">
                                    <label for="email">Correo electrónico</label>
                                    <input type="email" v-model="email_recuperar" id="email_recuperar"
                                        class="form-control form-control-lg" />
                                </div>
                                <div class="btn-cerrar">
                                    <!-- <div class="btn-cerrar">
                                    <label @click="cambiarContraseña" for="btn-modal">Enviar</label>
                                </div> -->
                                    <button for="btn-modal"
                                        class="btn btn-lg btn-primary px-4">
                                        <span>Recuperar</span>
                                    </button>
                                </div>
                            </div>
                            <label for="btn-modal" class="cerrar-modal"></label>
                        </form>
                    </div>
                    <!--Fin de Ventana Modal-->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import Swal from "sweetalert2";
export default {
    name: "Login",
    data() {
        return {
            email: "",
            password: "",
            xhrRequest: false,
            errorMessage: "",
            successMessage: "",
            email_recuperar: ""

        };
    },
    methods: {
        loginRequest() {
            let v = this;

            v.xhrRequest = true;
            v.errorMessage = "";
            v.successMessage = "";
            if (!v.email || !v.password) {
                v.errorMessage =
                    "Por favor, ingrese su correo electrónico y contraseña.";
                v.xhrRequest = false;
                return;
            }

            const auth = getAuth();
            signInWithEmailAndPassword(auth, v.email, v.password).then(
                () => {
                    this.$router.replace("/home");
                    v.xhrRequest = false;

                    const Toast = Swal.mixin({
                        toast: true,
                        position: "top-start",
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                        didOpen: toast => {
                            toast.addEventListener("mouseenter", () => {
                                Swal.stopTimer();
                            });
                            toast.addEventListener("mouseleave", () => {
                                Swal.resumeTimer();
                            });
                        }
                    });

                    Toast.fire({
                        icon: "success",
                        title: "Inicio de sesión exitoso."
                    });
                },
                error => {
                    console.log(error.code);
                    switch (error.code) {
                        case "auth/user-not-found":
                            v.errorMessage =
                                "El correo electrónico no se encuentra registrado.";
                            v.xhrRequest = false;
                            break;

                        case "auth/wrong-password":
                            v.errorMessage =
                                "La contraseña ingresada es incorrecta. Por favor, verifíquela.";
                            v.xhrRequest = false;
                            break;

                        case "auth/too-many-requests":
                            v.errorMessage =
                                "El acceso a esta cuenta ha sido temporalmente deshabilitado debido a muchos intentos fallidos. Puedes restaurarlo de inmediato restableciendo tu contraseña o puedes intentarlo nuevamente más tarde.";
                            v.xhrRequest = false;
                            break;

                        case "auth/invalid-email":
                            v.errorMessage = "Correo electrónico inválido.";
                            v.xhrRequest = false;
                            break;

                        case "auth/network-request-failed":
                            v.errorMessage =
                                "Error al conectarse a la red, favor de intentarlo más tarde.";
                            v.xhrRequest = false;
                            break;

                        case "auth/internal-error":
                            v.errorMessage =
                                "Error interno, favor de intentarlo más tarde.";
                            v.xhrRequest = false;
                            break;

                        case "auth/invalid-login-credentials":
                            v.errorMessage =
                                "La contraseña ingresada es incorrecta. Por favor, verifíquela.";
                            v.xhrRequest = false;
                            break;

                        default:
                            v.errorMessage = error.message;
                            //v.errorMessage = "Ha ocurrido un error durante el inicio de sesión. Por favor, inténtelo de nuevo más tarde.";
                            v.xhrRequest = false;
                    }
                }
            );
        },
        cambiarContrasena() {
            let v = this;
            if (!v.email_recuperar) {
                alert("Por favor, ingrese su correo electrónico.");
                return;
            }
            const auth = getAuth();
            console.log(this.email_recuperar);
            sendPasswordResetEmail(auth, this.email_recuperar)
                .then(() => {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: "top-start",
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true,
                        didOpen: toast => {
                            toast.addEventListener(
                                "mouseenter",
                                Swal.stopTimer
                            );
                            toast.addEventListener(
                                "mouseleave",
                                Swal.resumeTimer
                            );
                        }
                    });

                    Toast.fire({
                        icon: "success",
                        title: "Correo enviado, revisa tu bandeja de entrada."
                    });
                    this.user = {
                        email: ""
                    };
                })
                .catch(error => {
                    if (error.code == "auth/invalid-email") {
                        alert("Correo electrónico inválido.");
                    } else {
                        alert(error);
                    }
                });
        }
    }
};
</script>

<style scoped>
.login-container {
    background: linear-gradient(to bottom, #d64ff7, #4a43df);
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

.loader {
    position: relative;
    top: 6px;
    left: 10px;
}

.login-content {
    align-content: center;
    align-items: center;
    background-color: #fff;
    width: 600px;
    height: 655px;
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
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

/*:::Ventana Modal:::*/
#btn-modal {
    display: none;
}

.container-modal {
    animation: animacionEntrada 1s ease;
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(144, 148, 150, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

#btn-modal:checked~.container-modal {
    display: flex;
}

.content-modal {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
}

.content-modal h2 {
    margin-bottom: 15px;
}

.content-modal p {
    padding: 15px 0px;
    border-top: 1px solid #dbdbdb;
    border-bottom: 1px solid #dbdbdb;
}

.content-modal .btn-cerrar {
    width: 100%;
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
}

.content-modal .btn-cerrar label {
    padding: 7px 10px;
    background-color: #5488a3;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    transition: all 300ms ease;
}

.content-modal .btn-cerrar label:hover {
    background-color: #185e83;
}

.cerrar-modal {
    animation: animacionSalida 1s ease;
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
}

@media screen and (max-width: 800px) {
    .content-modal {
        width: 90%;
    }
}

@keyframes animacionEntrada {
    from {
        opacity: 0;
        transform: translateY(0);
    }

    to {
        opacity: 100%;
        transform: translateY(0.1px);
    }
}

@keyframes animacionSalida {
    from {
        opacity: 100%;
        transform: translateY(0.1px);
    }

    to {
        opacity: 0;
        transform: translateY(-10px);
    }
}

/*:::Boton-Modal:::*/
.boton-modal {
    background-color: #fff;
}

.boton-modal label {
    padding: 10px 15px;
    background-color: #ffffff;
    color: #201ab6;
    border-radius: 4px;
    cursor: pointer;
    transition: all 300ms ease;
}

.boton-modal label:hover {
    background-color: #1e7efb;
    color: #ffffff;
}

/*:::Fin Boton-Modal:::*/
</style>
