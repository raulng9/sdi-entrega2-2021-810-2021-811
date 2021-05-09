module.exports = function (app, gestorProductos, gestorChat) {

    app.post("/api/enviarmensaje", function (req, res) {
            let date = new Date();
            let usuario = req.session.usuario;
            let producto = req.body.producto;
            let criterio_producto = {
                "_id": gestorProductos.mongo.ObjectID(producto)
            };
            gestorProductos.obtenerProductos(criterio_producto, function (productos) {
                if (productos == null) {
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener los productos de la BBDD"
                    });
                }
                //Obtenemos los detalles para buscar la conversación en la BBDD
                let propietario = productos[0].propietario;
                let texto = req.body.texto;
                let id_producto = productos[0]._id.toString();
                let criterio_conversacion = {
                    "usuario1": usuario,
                    "usuario2": propietario,
                    "producto": id_producto
                };

                if (usuario === propietario && typeof req.body.recep === 'undefined') {
                    res.status(500);
                    res.json({
                        error: "Error de formato en los datos, falta el receptor o el usuario es el propietario del producto"
                    })
                } else {
                    //Envío correcto a priori
                    if (usuario === propietario && typeof req.body.recep !== 'undefined') {
                        let receptor = req.body.recep;
                        //Criterio general para la conv. (para crear o para buscar)
                        criterio_conversacion = {
                            "usuario1": receptor,
                            "usuario2": propietario,
                            "producto": id_producto
                        };
                    }
                    gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                        //Conversación no existente porque el usuario no puede hablar consigo mismo
                        if (conversaciones.length === 0 && usuario === propietario) {
                            res.status(500);
                            res.json({
                                error: "Solo los usuarios interesados pueden iniciar una conversación"
                            })
                            //Conversación ya existente, solamente tenemos que incluir el nuevo mensaje
                        } else if (conversaciones.length > 0) {
                            let id_conversacion = conversaciones[0]._id;
                            let criterio_mensaje = {
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
                                        error: "Se ha producido un error al insertar el mensaje en la conversación"
                                    })
                                } else {
                                    res.status(201);
                                    res.json({
                                        mensaje: "Mensaje enviado con éxito"
                                    })
                                }
                            });
                        } else {
                            //Nueva conversación, se crea y luego se inserta el mensaje en ella
                            gestorChat.insertarConversacion(criterio_conversacion, function (conversacion) {
                                if (conversacion == null) {
                                    res.status(500); // Unauthorized
                                    res.json({
                                        error: "Se ha producido un error al insertar la conversación en la BBDD"
                                    })
                                } else {
                                    let criterio_mensaje = {
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
                                                error: "Se ha producido un error al insertar el mensaje en la conversación"
                                            })
                                        } else {
                                            res.status(201);
                                            res.json({
                                                error: "Mensaje enviado con éxito"
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

    //Obtener conversación para un producto dado
    app.get("/api/mensajes/:producto", function (req, res) {
        let usuario = req.session.usuario;
        var producto = req.params.producto;
        let criterio_producto = {
            _id: gestorProductos.mongo.ObjectID(producto)
        };

        gestorProductos.obtenerProductos(criterio_producto, function (productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error: "Error al obtener el producto de la conversación"
                });
            } else {
                if (productos) {
                    let criterio_conversacion = {
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
                    //Obtenemos conversación relativa al producto
                    gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                        if (conversaciones === null) {
                            res.status(501);
                            res.json({
                                error: "Se produjo un error al obtener las conversaciones de la BBDD"
                            });
                            //Caso de propietario del producto
                        } else if (productos[0].propietario === usuario) {
                            if (typeof req.headers['conversacion'] === 'undefined') {
                                res.status(200);
                                res.send(JSON.stringify(conversaciones));
                            } else if (typeof req.headers['conversacion'] !== 'undefined') {
                                let conversacion = req.headers['conversacion'];
                                let criterio_mensajes = {
                                    "conversacion": gestorChat.mongo.ObjectID(conversacion)
                                };
                                gestorChat.obtenerMensajes(criterio_mensajes, function (mensajes) {
                                    if (mensajes == null) {
                                        res.status(501);
                                        res.json({
                                            error: "Se produjo un error al obtener las conversaciones de la BBDD"
                                        })
                                    } else {
                                        res.status(200);
                                        res.send(JSON.stringify(mensajes));
                                    }
                                });
                            }
                            //Caso de usuario interesado en el producto
                        } else {
                            let criterio_mensajes = {
                                conversacion: {
                                    $in: conversaciones.map(c => c._id)
                                }
                            };
                            gestorChat.obtenerMensajes(criterio_mensajes, function (mensajes) {
                                if (mensajes == null) {
                                    res.status(501);
                                    res.json({
                                        error: "Se produjo un error al obtener los mensajes de la BBDD"
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

    //Obtener todas las conversaciones en las que el usuario haya tomado parte
    app.get("/api/conversaciones/interesado", function (req, res) {
        let usuario = req.session.usuario;
        //En este caso basta con que el usuario esté involucrado en la conversación, sin importar el rol
        let criterio_usuario_en_conv = {
            "usuario1": usuario
        };
        gestorChat.obtenerConversacion(criterio_usuario_en_conv, function (conversaciones) {
            if (conversaciones === null) {
                res.status(501);
                //TODO manejar error y mandar dato de fallo para mostrar en la vista
                res.json({
                    error: "El usuario no tiene conversaciones como interesado por el momento"
                });
            } else {
                res.send(JSON.stringify(conversaciones));
            }
        });
    });

    //Obtener todas las conversaciones en las que el usuario haya tomado parte
    app.get("/api/conversaciones/propietario", function (req, res) {
        let usuario = req.session.usuario;
        //En este caso basta con que el usuario esté involucrado en la conversación, sin importar el rol
        let criterio_usuario_en_conv = {
            "usuario2": usuario
        };
        gestorChat.obtenerConversacion(criterio_usuario_en_conv, function (conversaciones) {
            if (conversaciones === null) {
                res.status(501);
                //TODO manejar error y mandar dato de fallo para mostrar en la vista
                res.json({
                    error: "El usuario no tiene conversaciones como propietario por el momento"
                });
            } else {
                console.log(JSON.stringify(conversaciones));
                res.send(JSON.stringify(conversaciones));
            }
        });
    });

    //Obtener todos los mensajes de una conversación dada
    app.get("/api/mensajes/conv/:conversacion", function (req, res) {
        var conversacion = req.params.conversacion;
        //En este caso basta con que el usuario esté involucrado en la conversación, sin importar el rol
        console.log("buscando mensajes de la conversación " + conversacion);
        let criterio_conversacion = {
            "_id": gestorChat.mongo.ObjectID(conversacion)
        };

        gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
            if (conversaciones === null) {
                res.status(501);
                res.json({
                    error: "Se produjo un error al obtener las conversaciones de la BBDD"
                });
                //Caso de propietario del producto
            } else {
                let conversacion = req.headers['conversacion'];
                let criterio_mensajes = {
                    "conversacion": gestorChat.mongo.ObjectID(conversacion)
                };
                gestorChat.obtenerMensajes(criterio_mensajes, function (mensajes) {
                    if (mensajes == null) {
                        res.status(501);
                        res.json({
                            error: "Se produjo un error al obtener las conversaciones de la BBDD"
                        })
                    } else {
                        res.status(200);
                        console.log("mensajes obtenidos");
                        console.log(JSON.stringify(mensajes));
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    });

    //Obtener todos los mensajes de una conversación dada
    app.get("/api/mensajes/eliminar/:id", function (req, res) {
        console.log("eliminando mensaje " + req.params.id);
        let criterio_mensaje = {"_id": gestorChat.mongo.ObjectID(req.params.id)};
        gestorChat.eliminarMensaje(criterio_mensaje, function (mensaje) {
            if (mensaje === null) {
                res.status(501);
                res.json({
                    error: "El mensaje a eliminar no se ha encontrado"
                });
            } else {
                res.status(200);
                console.log("a eliminar mensaje");
                res.send(JSON.stringify(mensaje));
            }
        });
    });

    //Obtener todos los mensajes de una conversación dada
    app.get("/api/conversaciones/eliminar/:id", function (req, res) {
        let criterio_conversacion = {"_id": gestorChat.mongo.ObjectID(req.params.id)};
        console.log("eliminando conversación " + req.params.id);
        gestorChat.eliminarConversacion(criterio_conversacion, function (mensaje) {
            if (mensaje === null) {
                res.status(501);
                res.json({
                    error: "La conversación a eliminar no se ha encontrado"
                });
            } else {
                res.status(200);
                console.log("Conversación eliminada correctamente");
                res.send(JSON.stringify(mensaje));
            }
        });
    });

}