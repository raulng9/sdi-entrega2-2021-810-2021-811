module.exports = function(app, swig, gestorUsuarios, gestorProductos) {

    //Post con los datos para añadir un producto a la tienda
    app.post("/producto", function(req, res) {
        if(req.body.nombre === '' || req.body.descripcion === '' || req.body.precio === '')
        {
            res.send("Error en los datos del producto");
        }
        else {
            let productoParaInsertar = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: req.body.precio,
                fecha: new Date(),
                propietario: req.session.usuario,
                comprador: null
            };
            gestorProductos.insertarProducto(productoParaInsertar, function (id) {
                if (id == null) {
                    res.send("Error al añadir el producto");
                } else {
                    if (req.files != null) {
                        if (req.files.imagen != null) {
                            let imagen = req.files.imagen;
                            imagen.mv('public/portadas/' + id + '.png', function (err) {
                                if (err) {
                                    res.send("Error al añadir la imagen del producto");
                                }
                            });
                        }
                    }
                    res.redirect("/publicaciones");
                }
            });
        }
    });

    //Get para el insertado de producto en la tienda
    app.get('/producto/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {
            usuario : req.session.usuario,
            dinero : req.session.dinero
        });
        res.send(respuesta);
    });

    //Vista general con todos los productos de la tienda (excluir propios?)
    app.get("/tienda", function(req, res) {
        let criterio  = {};
        if( req.query.busqueda != null ){
            criterio = {
                "nombre" :  {$regex : ".*"+req.query.busqueda +".*", $options: 'i'},
            };
        }

        let pg = parseInt(req.query.pg);

        //Para evitar problemas si el parámetro no se envía
        if ( req.query.pg == null){
            pg = 1;
        }

        //Paginación simple con 5 elementos por página según guion
        gestorProductos.obtenerProductosConPaginacion(criterio, pg , function(productos, total ) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total/5;
                if (total % 5 > 0 ){
                    ultimaPg = ultimaPg+1;
                }
                let paginas = [];
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        productos : productos,
                        usuario : req.session.usuario,
                        dinero : req.session.dinero,
                        paginas: paginas,
                        actual : pg
                    });
                res.send(respuesta);
            }
        });
    });

    //Get para la vista detallada de un producto de la tienda
    app.get('/producto/:id', function (req, res) {
        let criterio = { "_id" : gestorProductos.mongo.ObjectID(req.params.id)  };
        gestorProductos.obtenerProductos(criterio,function(productos){
            if ( productos == null ){
                res.redirect('/tienda');
            } else {
                let respuesta = swig.renderFile('views/bdetallesproducto.html',
                    {
                        producto : productos[0],
                        usuario : req.session.usuario,
                        dinero : req.session.dinero
                    });
                res.send(respuesta);
            }
        });
    });

    //Get para las ofertas propias del usuario
    app.get("/publicaciones", function(req, res) {
        let criterio = { propietario : req.session.usuario };
        gestorProductos.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        productos : productos,
                        usuario : req.session.usuario,
                        dinero : req.session.dinero
                    });
                res.send(respuesta);
            }
        });
    });

    //Get para acceder a la vista de modificar producto (criterio dueño)
    app.get('/producto/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorProductos.mongo.ObjectID(req.params.id) };
        gestorProductos.obtenerProductos(criterio,function(productos){
            if ( productos == null ){
                res.redirect('/publicaciones');
            } else {
                let respuesta = swig.renderFile('views/bproductoModificar.html',
                    {
                        producto : productos[0],
                        usuario : req.session.usuario,
                        dinero : req.session.dinero
                    });
                res.send(respuesta);
            }
        });
    });

    //Post para enviar la nueva información del producto
    app.post('/producto/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorProductos.mongo.ObjectID(id) };
        let producto = {
            nombre : req.body.nombre,
            descripcion : req.body.descripcion,
            precio : req.body.precio
        };
        gestorProductos.modificarProducto(criterio, producto, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                modificarFotoProducto(req.files, id, function (result) {
                    if( result == null){
                        res.redirect("/publicaciones");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    //Función auxiliar para cambiar la fotografía de un producto
    function modificarFotoProducto(files, id, callback) {
        if(files != null){
            if (files.portada != null) {
                let imagen = files.portada;
                imagen.mv('public/portadas/' + id + '.png', function (err) {
                    if (err) {
                        callback(null); // ERROR
                    } else {
                        callback(true);
                    }
                });
            }
        }
        else
        {
            callback(true);
        }
    }

    //Get para eliminar un producto de la BBDD
    app.get('/producto/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorProductos.mongo.ObjectID(req.params.id) };
        gestorProductos.eliminarProducto(criterio,function(productos){
            if ( productos == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    //Obtener compras propias del usuario y enviar a vista
    app.get('/compras', function (req, res) {
        let criterio = { "comprador" : req.session.usuario };
        gestorProductos.obtenerProductos( criterio, function(productos) {
            if (productos == null) {
                res.send("Error al listar productos");
            } else {
                let respuesta = swig.renderFile('views/bcompras.html',
                    {
                        productos : productos,
                        usuario : req.session.usuario,
                        dinero : req.session.dinero
                    });
                res.send(respuesta);
            }
        });
    });
};
