module.exports = function(app, gestorUsuarios) {


    /**
     * Método Post para autenticar a un usuario en la aplicación
     * Se utiliza un token de seguridad para que solo los usuarios que dispongan de ese token puedan
     * utilizar la aplicación.
     */
    app.post("/api/autenticar", function(req, res) {

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        };

        gestorUsuarios.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                app.get("logger").error("API: Error al identificar usuario");
                res.status(401);
                res.json({ autenticado : false})
            } else {
                let token = app.get('jwt').sign(
                        {
                            usuario: criterio.email ,
                            tiempo: Date.now()/1000}, "secreto");
                app.get("logger").info("API: Usuario " + usuarios[0].email + " identificado con éxito");
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
