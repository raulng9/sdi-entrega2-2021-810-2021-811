module.exports = function (app, gestorProductos, gestorChat) {
//Enviar mensajes
    app.post("/api/mensajes", function (req, res) {
            var date = new Date();
            var usuario = req.session.usuario;
            var producto = req.body.producto;
            var criterio_producto = {
                "_id": gestorProductos.mongo.ObjectID(producto)
            };
            gestorProductos.obtenerProductos(criterio_producto, function (productos) {
                if (productos == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    });
                }
                var propietario = productos[0].propietario;
                var texto = req.body.texto;
                var id_producto = productos[0]._id.toString();
                var criterio_conversacion = {
                    "usuario1": usuario,
                    "usuario2": propietario,
                    "producto": id_producto
                };

                if (usuario === propietario && typeof req.body.recep === 'undefined') {
                    res.status(500);
                    res.json({
                        error: "Error de formato"
                    })
                } else {
                    if (usuario === propietario && typeof req.body.recep !== 'undefined') {
                        var receptor = req.body.recep;
                        criterio_conversacion = {
                            "usuario1": receptor,
                            "usuario2": propietario,
                            "producto": id_producto
                        };
                    }
                    gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                        if (conversaciones.length === 0 && usuario === propietario) {
                            res.status(500);
                            res.json({
                                error: "el usuario propietario de un producto no puede iniciar el chat."
                            })
                        } else if (conversaciones.length > 0) {
                            var id_conversacion = conversaciones[0]._id;
                            var criterio_mensaje = {
                                "emisor": usuario,
                                "texto": texto,
                                "leido": false,
                                "fecha": date,
                                "conversacion": id_conversacion
                            };
                            gestorChat.insertarMensaje(criterio_mensaje, function (mensajes) {
                                if (mensajes == null) {
                                    res.status(500);
                                    res.json({
                                        error: "se ha producido un error insertado el mensaje"
                                    })
                                } else {
                                    res.status(201);
                                    res.json({
                                        mensaje: "Mensaje enviado"
                                    })
                                }
                            });
                        } else {
                            gestorChat.insertarConversacion(criterio_conversacion, function (conversacion) {
                                if (conversacion == null) {
                                    res.status(500); // Unauthorized
                                    res.json({
                                        error: "se ha producido un error insertando la conversación"
                                    })
                                } else {
                                    var criterio_mensaje = {
                                        "emisor": usuario,
                                        "texto": texto,
                                        "leido": false,
                                        "fecha": date,
                                        "conversacion": conversacion
                                    };
                                    gestorChat.insertarMensaje(criterio_mensaje, function (mensajes) {
                                        if (mensajes == null) {
                                            res.status(500);
                                            res.json({
                                                error: "se ha producido un error insertando el mensaje"
                                            })
                                        } else {
                                            res.status(201);
                                            res.json({
                                                error: "Mensaje enviado"
                                            })
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    );

    app.get("/api/leermensajes/:producto", function (req, res) {
        var usuario = req.session.usuario;
        var producto = req.params.producto;

        var criterio_producto = {
            _id: gestorProductos.mongo.ObjectID(producto)
        };
        gestorProductos.obtenerProductos(criterio_producto, function (productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error: "no se ha encontrado el producto"
                })
            } else {
                if (productos) {
                    var criterio_conversacion = {
                        producto: producto
                    };
                    if (productos[0].propietario !== usuario) {
                        criterio_conversacion = {
                            producto: producto,
                            usuario1: usuario
                        };
                    } else if (productos[0].propietario === usuario) {
                        criterio_conversacion = {
                            producto: producto,
                            usuario2: usuario
                        }
                    }
                    gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                        if (conversaciones === null) {
                            res.status(501);
                            res.json({
                                error: "se ha producido un error obteniendo las conversaciones las conversaciones"
                            })
                        } else if (productos[0].propietario === usuario) {
                            if (typeof req.headers['conversacion'] === 'undefined') {
                                res.status(200);
                                res.send(JSON.stringify(conversaciones));
                            } else if (typeof req.headers['conversacion'] !== 'undefined') {
                                var conversacion = req.headers['conversacion'];
                                var criterio_mensajes = {
                                    "conversacion": gestorChat.mongo.ObjectID(conversacion)
                                };
                                gestorChat.obtenerMensajes(criterio_mensajes, function (mensajes) {
                                    if (mensajes == null) {
                                        res.status(501);
                                        res.json({
                                            error: "se ha producido un error con los mensajes"
                                        })
                                    } else {
                                        res.status(200);
                                        res.send(JSON.stringify(mensajes));
                                    }
                                });
                            }
                        } else {
                            var criterio_mensajes = {
                                conversacion: {
                                    $in: conversaciones.map(c => c._id)
                                }
                            };
                            gestorChat.obtenerMensajes(criterio_mensajes, function (mensajes) {
                                if (mensajes == null) {
                                    res.status(501);
                                    res.json({
                                        error: "se ha producido un error con los mensajes"
                                    })
                                } else {
                                    res.status(200);
                                    res.send(JSON.stringify(mensajes));
                                }
                            });
                        }
                    });
                }
            }
        });
    });
}