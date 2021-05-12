module.exports = function(app, gestorProductos) {

    /**
     * Método Get para obtener una lista de las ofertas disponibles en la plataforma.
     * Se utiliza un token de seguridad para que únicamente los usuarios registrados puedan acceder a las ofertas
     * disponibles, y también para garantizar que sus propias ofertas no aparecen en la lista. Además, solo se tienen
     * en cuenta aquellas ofertas que siguen disponibles en el momento de la llamada (campo comprador con valor null).
     */
    app.get("/api/ofertas", function(req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                app.get("logger").error('API: No se pudieron cargar las ofertas debido a un token inválido');
                res.status(403); // Forbidden
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
            }
            let criterio = {
                //Operador para evitar mostrar los productos propios
                propietario: {$nin: [infoToken.usuario]},
                //Solo aquellas ofertas todavía disponibles
                comprador: null
            };

            gestorProductos.obtenerProductos(criterio, function (productos) {
                if (productos == null) {
                    app.get("logger").error("API: Error al obtener las ofertas");
                    res.status(500);
                    res.json({
                        error: "Error al obtener los productos de la BBDD"
                    })
                } else {
                    app.get("logger").info("API: Ofertas obtenidas con éxito");
                    res.status(200);
                    res.send(JSON.stringify(productos));
                }
            });
        });
    });

    /**
     * Método Get para obtener los datos de un producto determinado (utilizado por la API para buscar datos del producto
     * a partir de su ID).
     * Se utiliza un token de seguridad para que únicamente los usuarios logueados puedan acceder a la información de los
     * productos, pero no se aplican más restricciones ya que la información de los productos ha de estar disponible
     * para todos los usuarios.
     */
    app.get("/api/producto/:idProducto", function(req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            //En este caso no comprobamos nada más que la validez del token, ya que todos los usuarios pueden acceder
            //a la información de un producto
            if (err) {
                res.status(403); // Forbidden
                app.get("logger").info('API: No se pudieron obtener los datos del producto debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            }else {
                //Para acceder a los datos específicos de producto
                var producto = req.params.idProducto;
                let criterio_producto = {
                    _id: gestorProductos.mongo.ObjectID(producto)
                };
                gestorProductos.obtenerProductos(criterio_producto, function (productos) {
                    if (productos == null) {
                        app.get("logger").error("API: Error al obtener las ofertas");
                        res.status(500);
                        res.json({
                            error: "Error al obtener los productos de la BBDD"
                        })
                    } else {
                        app.get("logger").info("API: Producto obtenido correctamente");
                        res.status(200);
                        res.send(JSON.stringify(productos));
                    }
                });
            }
    });
    });
}
