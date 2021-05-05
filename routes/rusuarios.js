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

        gestorUsuarios.insertarUsuario(usuario, function (id) {
            if (id == null) {
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            } else {
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
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
                res.send("Error al obtener el usuario");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.saldo = usuarios[0].saldo;
                if (usuarios[0].email == "admin@email.com") {
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

    //TODO incluir redirección a vista de admin si el usuario lo es
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

    app.post('/usuario/eliminar', function (req, res) {
        var usuarios = req.body.usuarios;
        var criterio_usuario = {};
        var criterio_producto = {};
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
                    res.redirect('/administrar?mensaje=Se ha producido un error');
                }
            });
            gestorProductos.eliminarProducto(criterio_producto, function (productos) {
                if (productos == null) {
                    res.redirect('/administrar?mensaje=Se ha producido un error');
                }
            });
        }
        res.redirect("/administrar");
    });
};