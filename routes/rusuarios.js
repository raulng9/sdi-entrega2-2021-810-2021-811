module.exports = function (app, swig, gestorUsuarios, gestorProductos) {

    app.get("/iniciar", function (req, res) {
        let respuesta = swig.renderFile('views/busuariopublico.html', {});
        res.send(respuesta);
    });

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    //Por defecto creamos usuarios no-admin con 100 euros de saldo inicial
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
            email : req.body.email
        };
        gestorUsuarios.obtenerUsuarios(criterio, function (users) {
            if (users.length > 0) {
                res.redirect("/registrarse?mensaje=Usuario ya existente" + "&tipoMensaje=alert-danger");
            }
            else if(usuario.nombre.length <=1 ){
                res.redirect("/registrarse?mensaje=Nombre demasiado corto" + "&tipoMensaje=alert-danger");
            }
            else if(usuario.apellidos.length <=1 ){
                res.redirect("/registrarse?mensaje=Apellidos demasiado cortos" + "&tipoMensaje=alert-danger");
            }
            else if(usuario.email.length === 0 ){
                res.redirect("/registrarse?mensaje=Email demasiado corto" + "&tipoMensaje=alert-danger");
            }
            else if (req.body.password !== req.body.passwordConfirm){
                res.redirect("/registrarse?mensaje=Las contraseñas deben coincidir" + "&tipoMensaje=alert-danger");
            }
            else {
                gestorUsuarios.insertarUsuario(usuario, function (id) {
                    if (id == null) {
                        res.redirect("/registrarse?mensaje=Error al registrar usuario")
                    } else {
                        res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                    }
                });
            }
        });
    });


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
                res.redirect("/identificarse?mensaje=Email o contraseña inválidos" + "&tipoMensaje=alert-danger");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.saldo = usuarios[0].saldo;
                if (usuarios[0].email === "admin@email.com") {
                    res.redirect("/administrar")
                } else {
                    res.redirect("/publicaciones");
                }
            }

        });

    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse");
    });

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
                    res.redirect('/administrar?mensaje=Se ha producido un error'+ "&tipoMensaje=alert-danger");
                }
            });
            gestorProductos.eliminarProducto(criterio_producto, function (productos) {
                if (productos == null) {
                    res.redirect('/administrar?mensaje=Se ha producido un error'+ "&tipoMensaje=alert-danger");
                }
            });
        }
        res.redirect("/administrar");
    });
};