module.exports = function(app, gestorProductos) {

    //TODO comentar
    /**
     *
     */
    app.get("/api/ofertas", function(req, res) {
        let criterio = {
            //Operador para evitar mostrar los productos propios
            propietario : {$nin: [req.session.usuario]},
            //Solo aquellas ofertas todavía disponibles
            comprador : null
        };

        gestorProductos.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                app.get("logger").error("API: Error al obtener las ofertas");
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la BBDD"
                })
            } else {
                app.get("logger").info("API: Ofertas obtenidas con éxito");
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });

    //TODO comentar
    app.get("/api/productospropios", function(req, res) {
        console.log(req.session.usuario);
        //Para acceder a los productos que vende el usuario
        let criterio = {
            propietario : req.session.usuario
        };
        console.log("Buscando productos del usuario " + [req.session.usuario]);
        gestorProductos.obtenerProductos( criterio, function(productos) {
            if (productos == null) {
                app.get("logger").error("API: Error al obtener las ofertas");
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la BBDD"
                })
            } else {
                app.get("logger").info("API: Productos obtenidos correctamente");
                res.status(200);
                console.log(JSON.stringify(productos));
                res.send( JSON.stringify(productos) );
            }
        });
    });

    //TODO comentar
    app.get("/api/producto/:idProducto", function(req, res) {
        //Para acceder a los datos específicos de producto
        var producto = req.params.idProducto;
        let criterio_producto = {
            _id: gestorProductos.mongo.ObjectID(producto)
        };
        console.log("Buscando datos del producto " + [req.params.producto]);
        gestorProductos.obtenerProductos( criterio_producto, function(productos) {
            if (productos == null) {
                app.get("logger").error("API: Error al obtener las ofertas");
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la BBDD"
                })
            } else {
                app.get("logger").info("API: Producto obtenido correctamente");
                res.status(200);
                console.log(JSON.stringify(productos));
                res.send( JSON.stringify(productos) );
            }
        });
    });

}
