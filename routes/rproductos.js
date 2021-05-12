module.exports = function (app, swig, gestorUsuarios, gestorProductos) {

    /**
     * Metodo Post con los datos para añadir un producto a la tienda.
     * Se comprueba primero los parámetros de entrada, si son correctos se produce a añadir el producto.
     * Si este producto es de carácter destacado se quita 20 euros al usuario si los tiene y se cambia la propiedad del producto
     * a destacada : true.
     */
    app.post("/producto", function (req, res) {
        let usuario = req.session.usuario;
        console.log(usuario);
        if (req.body.nombre === '' || req.body.descripcion === '' || req.body.precio === '') {
            res.send("Error en los datos del producto");
        } else if (req.body.nombre.length <= 2) {
            res.redirect("/producto/agregar?mensaje=Nombre demasiado corto" + "&tipoMensaje=alert-danger")
        } else if (req.body.precio <= 0) {
            res.redirect("/producto/agregar?mensaje=El precio no puede ser negativo ni cero" + "&tipoMensaje=alert-danger")
        } else {
            let productoParaInsertar = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: req.body.precio,
                fecha: new Date(),
                propietario: req.session.usuario,
                comprador: null,
                destacada: false
            };
            if (req.body.destacarProducto === "destacarProducto") {
                productoParaInsertar.destacada = true;
            }
            gestorProductos.insertarProducto(productoParaInsertar, function (id) {
                    if (id == null) {
                        app.get("logger").error("Error al añadir producto producto");
                        res.send("Error al añadir el producto");
                    } else {
                        if (productoParaInsertar.destacada) {
                            var criterio_usuario = {
                                email: req.session.usuario
                            };
                            gestorUsuarios.obtenerUsuarios(criterio_usuario, function (usuarios) {
                                if (20 > usuarios[0].saldo) {
                                    app.get("logger").error("Saldo insuficiente para destacar tu oferta");
                                    res.redirect("/producto/agregar?mensaje=No posee suficiente saldo");
                                } else {
                                    var actualizacion_usuario = {
                                        saldo: usuarios[0].saldo - 20
                                    };
                                    req.session.saldo = usuarios[0].saldo - 20;
                                    gestorUsuarios.modificarUsuarios(criterio_usuario, actualizacion_usuario, function (users) {
                                            if (users == null) {
                                                app.get("logger").error("Error al añadir producto producto");
                                                res.redirect("/producto/agregar?mensaje=Ha ocurrido un error");
                                            } else
                                                app.get("logger").info("Producto destacado añadido con éxito");
                                            res.redirect("/publicaciones");
                                        }
                                    );
                                }
                            });
                        } else {
                            app.get("logger").info("Producto añadido con éxito");
                            res.redirect("/publicaciones");
                        }
                    }
                }
            );
        }
    });


    /**
     * Metodo Get para el insertado de producto en la tienda
     */
    app.get('/producto/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {
            usuario: req.session.usuario,
            saldo: req.session.saldo
        });
        res.send(respuesta);
    });


    /**
     * Metodo Get para el insertado de producto en la tienda
     * Se mostrarán los productos con una paginación de 5 objetos por página
     */
    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {
                "nombre": {$regex: ".*" + req.query.busqueda + ".*", $options: 'i'},
            };
        }

        let pg = parseInt(req.query.pg);

        //Para evitar problemas si el parámetro no se envía, por defecto a la página 1
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
                app.get("logger").info("Vista de todas las ofertas disponibles");
                res.send(respuesta);
            }
        });
    });


    /**
     * Método Get para los ofertas que sean propias del usuario
     * Se obtienen los productos de la BBDD que tengan como propietario al usuario en sesión
     * y se muestran todas.
     */
    app.get("/publicaciones", function (req, res) {
        let criterio = {propietario: req.session.usuario};
        gestorProductos.obtenerProductos(criterio, function (productos) {
            if (productos == null) {
                app.get("logger").error("Error al listar las ofertas");
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        productos: productos,
                        usuario: req.session.usuario,
                        saldo: req.session.saldo
                    });
                app.get("logger").info("Mostrando tus ofertas");
                res.send(respuesta);
            }
        });
    });


    /**
     * Método Get para eliminar un producto de la BBDD
     * Sólo se podrá eliminar un producto si eres el propietario y si esta oferta no ha sido comprada todavía
     */
    app.get('/producto/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorProductos.mongo.ObjectID(req.params.id)};
        gestorProductos.obtenerProductos(criterio, function (productoss) {
            if (productoss[0].propietario != req.session.usuario) {
                app.get("logger").error("No puedes eliminar esta oferta ya que no eres el propietario");
                res.redirect("/publicaciones?mensaje=No eres el propietario de la oferta" + "&tipoMensaje=alert-danger");
            } else if (productoss[0].comprador != null) {
                app.get("logger").error("No puedes eliminar esta oferta ya que ya ha sido comprada");
                res.redirect("/publicaciones?mensaje=Esta oferta ya ha sido comprada" + "&tipoMensaje=alert-danger");
            } else {
                gestorProductos.eliminarProducto(criterio, function (productos) {
                    if (productos == null) {
                        app.get("logger").error("Error al eliminar oferta");
                        res.redirect("/publicaciones?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
                    } else {
                        app.get("logger").info("Producto " + productoss[0].nombre + " eliminado con éxito");
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    /**
     * Método Get para comprar productos en la tienda.
     * Se comprueba primero que el producto que se va a comprar exista, después se comprueba si el usuario en sesion posee el saldo suficiente
     * y que no sea el propietario del producto en cuestión. Si es así se quita el saldo correspondiente al producto, se le añade un comprador,
     * en este caso el usuario en sesión y se finaliza con la operación.
     */
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
                app.get("logger").error("Error comprando el producto");
                res.redirect("/tienda?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
            } else {
                var criterio_usuario = {
                    email: req.session.usuario
                };
                gestorUsuarios.obtenerUsuarios(criterio_usuario, function (usuarios) {
                        if (productos[0].precio > usuarios[0].saldo) {
                            app.get("logger").error("No posees suficiente saldo para comprar esa oferta");
                            res.redirect("/tienda?mensaje=No posee suficiente saldo" + "&tipoMensaje=alert-danger");
                        } else {
                            if (productos[0].propietario !== req.session.usuario && productos[0].comprador == null) {
                                gestorProductos.modificarProducto(criterio, producto, function (idCompra) {
                                    if (idCompra == null) {
                                        res.redirect("/tienda?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
                                    } else {
                                        var actualizacion_usuario = {
                                            saldo: usuarios[0].saldo - productos[0].precio
                                        };
                                        req.session.saldo = usuarios[0].saldo - productos[0].precio;
                                        gestorUsuarios.modificarUsuarios(criterio_usuario, actualizacion_usuario, function (users) {
                                                if (users == null)
                                                    res.redirect("/tienda?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
                                                else
                                                    app.get("logger").info("Compra realizada con éxito");
                                                res.redirect("/compras");
                                            }
                                        );
                                    }
                                });
                            } else {
                                res.redirect("/tienda?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
                            }
                        }
                    }
                );
            }
        });
    });


    /**
     * Método Get para obtener compras propias del usuario y enviar a la vista bcompras
     */
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
                app.get("logger").info("Cargando tus compras");
                res.send(respuesta);
            }
        });
    });

    /**
     * Metodo Get para destacar un producto.
     * Primero se busca que el producto que se quiere destacar existe en la BBDD, si es así se modifica el producto para que
     * el parámetro destacada pase a tener el valor true. Esto solo se hará si el usuario posee el crédito suficiente.
     */
    app.get('/producto/destacar/:id', function (req, res) {
        var productoId = gestorProductos.mongo.ObjectID(req.params.id);
        var criterio_producto = {
            "_id": productoId
        };
        gestorProductos.obtenerProductos(productoId, function (productos) {
                if (productos == null || productos.length == 0)
                    res.send("Error al encontrar producto");
                else {
                    let producto = productos[0];
                    console.log(producto);
                    producto.destacada = true;
                    console.log(producto);
                    gestorProductos.modificarProducto(criterio_producto, producto, function (result) {
                        if (result == null)
                            res.send("Error al modificar oferta");
                        else {
                            var criterio_usuario = {
                                email: req.session.usuario
                            };
                            gestorUsuarios.obtenerUsuarios(criterio_usuario, function (usuarios) {
                                if (20 > usuarios[0].saldo) {
                                    app.get("logger").error("No posee suficiente saldo para destacar la oferta");
                                    res.redirect("/publicaciones?mensaje=No posee suficiente saldo" + "&tipoMensaje=alert-danger");
                                } else {
                                    var actualizacion_usuario = {
                                        saldo: usuarios[0].saldo - 20
                                    };
                                    req.session.saldo = usuarios[0].saldo - 20;
                                    gestorUsuarios.modificarUsuarios(criterio_usuario, actualizacion_usuario, function (users) {
                                            if (users == null) {
                                                app.get("logger").error("Error destacando oferta");
                                                res.redirect("/publicaciones?mensaje=Ha ocurrido un error" + "&tipoMensaje=alert-danger");
                                            } else {
                                                app.get("logger").info("Producto destacado con éxito");
                                                res.redirect("/publicaciones");
                                            }
                                        }
                                    );
                                }
                            });
                        }

                    });
                }
            }
        );

    });
};
