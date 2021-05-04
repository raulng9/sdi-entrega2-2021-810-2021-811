module.exports = function(app, swig, gestorUsuarios, gestorProductos){

    app.get("/iniciar", function(req,res){
        let respuesta = swig.renderFile('views/busuariopublico.html', {});
        res.send(respuesta);
    });

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {}); res.send(respuesta);
    });

    //Por defecto creamos usuarios no-admin con 100 euros de saldo inicial
    app.post('/usuario', function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email : req.body.email,
            password: seguro,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            isAdmin: false,
            saldo: 100.0
        }

        gestorUsuarios.insertarUsuario(usuario, function(id) {
            if (id == null){
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            } else {
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
            }
        });
    });



    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorUsuarios.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                res.send("Error al obtener el usuario");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/publicaciones");
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
    });





};