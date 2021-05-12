module.exports = function (app, swig, gestorUsuarios, gestorProductos) {


    /**
     * Metodo que te redirige a la página de inicio,
     * donde podrás iniciar sesión o registrarte
     */
    app.get("/iniciar", function (req, res) {
        let respuesta = swig.renderFile('views/busuariopublico.html', {});
        res.send(respuesta);
    });

    /**
     * Metodo que te redirige a la vista de registro
     */
    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    /**
     * Metodo que te redirige a la vista para poder
     * identificarte como usuario,
     */
    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });


    /**
     * Metodo POST que crea un nuevo usuario y lo añade a la base de datos
     * Por defecto creamos usuarios no-admin con 100 euros de saldo inicial
     */
    app.post('/usuario', function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email: req.body.email,
            password: seguro,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            isAdmin: false,
            saldo: 100.0
        }
        let criterio = {
            email: req.body.email
        };
        gestorUsuarios.obtenerUsuarios(criterio, function (users) {
            if (users.length > 0) {
                res.redirect("/registrarse?mensaje=Usuario ya existente" + "&tipoMensaje=alert-danger");
            } else if (usuario.nombre.length <= 1) {
                res.redirect("/registrarse?mensaje=Nombre demasiado corto" + "&tipoMensaje=alert-danger");
            } else if (usuario.apellidos.length <= 1) {
                res.redirect("/registrarse?mensaje=Apellidos demasiado cortos" + "&tipoMensaje=alert-danger");
            } else if (usuario.email.length === 0) {
                res.redirect("/registrarse?mensaje=Email demasiado corto" + "&tipoMensaje=alert-danger");
            } else if (req.body.password !== req.body.passwordConfirm) {
                res.redirect("/registrarse?mensaje=Las contraseñas deben coincidir" + "&tipoMensaje=alert-danger");
            } else {
                gestorUsuarios.insertarUsuario(usuario, function (id) {
                    if (id == null) {
                        app.get("logger").error("Error al registrar usuario");
                        res.redirect("/registrarse?mensaje=Error al registrar usuario")
                    } else {
                        app.get("logger").info("Usuario " + usuario.email + " registrado con éxito");
                        res.redirect("/identificarse?mensaje=Nuevo usuario registrado");

                    }
                });
            }
        });
    });

    /**
     * Metodo POST que nos identifica como usuario en la aplicación. Lo primero que hacemos es coger la información que se detalla en el html
     * y comprobamos que los datos que inserta el usuario corresponden con algún usuario que tengamos en la BBDD, si es así lo redirigimos
     * a la página con sus propias publicaciones
     */
    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorUsuarios.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                app.get("logger").error("Error al identificarse");
                res.redirect("/identificarse?mensaje=Email o contraseña inválidos" + "&tipoMensaje=alert-danger");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.saldo = usuarios[0].saldo;
                if (usuarios[0].email === "admin@email.com") {
                    app.get("logger").info("Usuario administrador " + usuarios[0].email + " identificado con éxito");
                    res.redirect("/administrar")
                } else {
                    app.get("logger").info("Usuario " + usuarios[0].email + " identificado con éxito");
                    res.redirect("/publicaciones");
                }
            }

        });

    });


    /**
     * Metodo para cerrar la sesión en la aplicación
     */
    app.get('/desconectarse', function (req, res) {
        app.get("logger").info("Usuario " + req.session.usuario + " desconectado con éxito");
        req.session.usuario = null;
        res.redirect("/identificarse");
    });


    /**
     * Si el usuario que accede sesión es administrador, se le redirigirá a la vista badmin con
     * las opciones de administrador correspondientes
     */
    app.get('/administrar', function (req, res) {
        //En el gestor de usuarios obtenemos los que sean criterio admin=true
        //y devolvemos a la vista de admin
        var criterio = {
            isAdmin: false
        };
        gestorUsuarios.obtenerUsuarios(criterio, function (usuarios) {
            var respuesta = swig.renderFile('views/badmin.html', {
                usuarios: usuarios,
                usuario: req.session.usuario
            });
            res.send(respuesta);
        });
    });


    /**
     * Metodo POST que elimina un usuario siempre y cuando el que lo haga sea administrador.
     * Podrá borrar varios simultáneamente seleccionando varios de los checkbox de la vista html correspondiente.
     * Si se puede eliminar dicho usuario borrará también sus productos.
     */
    app.post('/usuario/eliminar', function (req, res) {
        let usuarios = req.body.usuarios;
        let criterio_usuario = {};
        let criterio_producto = {};
        if (typeof usuarios !== 'undefined') {
            //Si solo hay un usuario
            if (typeof usuarios === "string") {
                criterio_usuario = {
                    email: usuarios
                };
                criterio_producto = {
                    propietario: usuarios
                };
            }
            //Si hay más de un usuario seleccionado
            else if (typeof 'object') {
                criterio_usuario = {
                    email: {$in: usuarios}
                };
                criterio_producto = {
                    propietario: {$in: usuarios}
                };
            }
            gestorUsuarios.eliminarUsuario(criterio_usuario, function (usuarios) {
                if (usuarios == null) {
                    app.get("logger").error("Error al eliminar usuario");
                    res.redirect('/administrar?mensaje=Se ha producido un error' + "&tipoMensaje=alert-danger");
                }
            });
            gestorProductos.eliminarProducto(criterio_producto, function (productos) {
                if (productos == null) {
                    app.get("logger").error("Error al eliminar producto");
                    res.redirect('/administrar?mensaje=Se ha producido un error' + "&tipoMensaje=alert-danger");
                }
            });
        }
        app.get("logger").info("Usuario/s eliminado/s con éxito");
        res.redirect("/administrar");
    });
};