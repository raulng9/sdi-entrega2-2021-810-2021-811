module.exports = function(app, gestorUsuarios) {

    app.post("/api/autenticar/", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        };
        gestorUsuarios.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                res.status(401);
                res.json({ autenticado : false})
            } else {
                let token = app.get('jwt').sign(
                        {
                            usuario: criterio.email ,
                            tiempo: Date.now()/1000}, "secreto");
                req.session.usuario=usuarios[0].email;
                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                })
            }
        });
    });




}
