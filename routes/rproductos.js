module.exports = function (app, swig, gestorUsuarios, gestorProductos) {

    //Post con los datos para añadir un producto a la tienda
    app.post("/producto", function (req, res) {
        if (req.body.nombre === '' || req.body.descripcion === '' || req.body.precio === '') {
            res.send("Error en los datos del producto");
        } else if(req.body.nombre.length <= 2){
            res.redirect("/producto/agregar?mensaje=Nombre demasiado corto" + "&tipoMensaje=alert-danger")
        }else if(req.body.precio <= 0){
            res.redirect("/producto/agregar?mensaje=El precio no puede ser negativo ni cero" + "&tipoMensaje=alert-danger")
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
                    res.redirect("/publicaciones");
                }
            });
        }
    });

    //Get para el insertado de producto en la tienda
    app.get('/producto/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {
            usuario: req.session.usuario,
            saldo: req.session.saldo
        });
        res.send(respuesta);
    });

    //Vista general con todos los productos de la tienda (excluir propios?)
    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {
                "nombre": {$regex: ".*" + req.query.busqueda + ".*", $options: 'i'},
            };
        }

        let pg = parseInt(req.query.pg);

        //Para evitar problemas si el parámetro no se envía
        if (req.query.pg == null) {
            pg = 1;
        }

        //Paginación simple con 5 elementos por página según guion
        gestorProductos.obtenerProductosConPaginacion(criterio, pg, function (productos, total) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 5;
                if (total % 5 > 0) {
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = [];
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        productos: productos,
                        usuario: req.session.usuario,
                        saldo: req.session.saldo,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });
    });

    //Get para las ofertas propias del usuario
    app.get("/publicaciones", function (req, res) {
        let criterio = {propietario: req.session.usuario};
        gestorProductos.obtenerProductos(criterio, function (productos) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        productos: productos,
                        usuario: req.session.usuario,
                        saldo: req.session.saldo
                    });
                res.send(respuesta);
            }
        });
    });

    //Get para eliminar un producto de la BBDD
    app.get('/producto/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorProductos.mongo.ObjectID(req.params.id)};
        gestorProductos.eliminarProducto(criterio, function (productos) {
            if (productos == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    //Comprar producto
    app.get('/producto/comprar/:id', function (req, res) {
        var productoId = gestorProductos.mongo.ObjectID(req.params.id);
        var criterio = {
            "_id": productoId
        };
        var producto = {
            "comprador": req.session.usuario
        };
        gestorProductos.obtenerProductos(criterio, function (productos) {
            if (productos == null) {
                res.redirect("/tienda?mensaje=Ha ocurrido un error");
            } else {
                var criterio_usuario = {
                    email: req.session.usuario
                };
                gestorUsuarios.obtenerUsuarios(criterio_usuario, function (usuarios) {
                        if (productos[0].precio > usuarios[0].saldo) {
                            res.redirect("/tienda?mensaje=No posee suficiente saldo");
                        } else {
                            if (productos[0].propietario !== req.session.usuario && productos[0].comprador == null) {
                                gestorProductos.modificarProducto(criterio, producto, function (idCompra) {
                                    if (idCompra == null) {
                                        res.redirect("/tienda?mensaje=Ha ocurrido un error");
                                    } else {
                                        var actualizacion_usuario = {
                                            saldo: usuarios[0].saldo - productos[0].precio
                                        };
                                        req.session.saldo = usuarios[0].saldo - productos[0].precio;
                                        gestorUsuarios.modificarUsuarios(criterio_usuario, actualizacion_usuario, function (users) {
                                                if (users == null)
                                                    res.redirect("/tienda?mensaje=Ha ocurrido un error");
                                                else
                                                    res.redirect("/compras");
                                            }
                                        );
                                    }
                                });
                            } else {
                                res.redirect("/tienda?mensaje=Ha ocurrido un error");
                            }
                        }
                    }
                );
            }
        });
    });

    //Obtener compras propias del usuario y enviar a vista
    app.get('/compras', function (req, res) {
        let criterio = {"comprador": req.session.usuario};
        gestorProductos.obtenerProductos(criterio, function (productos) {
            if (productos == null) {
                res.send("Error al listar productos");
            } else {
                let respuesta = swig.renderFile('views/bcompras.html',
                    {
                        productos: productos,
                        usuario: req.session.usuario,
                        saldo: req.session.saldo
                    });
                res.send(respuesta);
            }
        });
    });
};
