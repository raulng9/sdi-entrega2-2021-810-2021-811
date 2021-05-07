module.exports = function(app, gestorProductos) {

    app.get("/api/ofertas", function(req, res) {
        let criterio = {
            //Operador para evitar mostrar los productos propios
            propietario : {$nin: [req.session.usuario]},
            //Solo aquellas ofertas todavía disponibles
            comprador : null
        };

        gestorProductos.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la BBDD"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });



    app.get("/api/productospropios", function(req, res) {
        //Para acceder a los productos que vende el usuario
        let criterio = {
            propietario : res.usuario
        };
        gestorProductos.obtenerProductos( criterio, function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la BBDD"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });
}
