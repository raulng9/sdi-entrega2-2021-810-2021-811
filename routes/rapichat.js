module.exports = function (app, gestorProductos, gestorChat) {

    //TODO comentar
    app.post("/api/enviarmensaje", function (req, res) {
            var token = req.headers['token'] || req.body.token || req.query.token;
            app.get('jwt').verify(token, 'secreto', function (errorToken, infoToken) {
                if (errorToken) {
                    app.get("logger").error('API: error al enviar mensaje debido a un token inválido');
                    res.status(403);
                    res.json({
                        acceso: false,
                        error: 'Token no válido'
                    });
                } else {
                    console.log("enviando mensaje del usuario " + req.session.usuario + " al producto " + req.body.producto);
                    let date = new Date();
                    let usuario = infoToken.usuario;
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
                                console.log(req.body.recep);
                                console.log(propietario);
                                console.log(id_producto);
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
                                            app.get("logger").info("API: Mensaje enviado con éxito");
                                            res.status(201);
                                            res.json({
                                                mensaje: "Mensaje enviado con éxito"
                                            })
                                        }
                                    });
                                } else {
                                    //Nueva conversación, se crea y luego se inserta en ella el mensaje
                                    gestorChat.insertarConversacion(criterio_conversacion, function (conversacion) {
                                        if (conversacion == null) {
                                            res.status(500); // Unauthorized
                                            res.json({
                                                error: "Se ha producido un error al insertar la conversación en la BBDD"
                                            })
                                        } else {
                                            app.get("logger").info("API: Conversación creada con éxito");
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
                                                    app.get("logger").info("API: Mensaje enviado con éxito");
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
            });
    });

    //TODO comentar
    //Obtener conversación para un producto dado
    app.get("/api/mensajes/:producto", function (req, res) {
        console.log("obteniendo las conversaciones para el producto " + req.params.producto);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403); // Forbidden
                app.get("logger").info('API: Token no valido');
                res.json({
                    acceso: false,
                    error: 'Token invalido o caducado'
                });
            } else {
                let usuario = infoToken.usuario;
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
                                                app.get("logger").info("API: Mensaje obtenido con éxito");
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
                                            app.get("logger").info("API: Mensaje obtenido con éxito");
                                            res.status(200);
                                            res.send(JSON.stringify(mensajes));
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    });

    //TODO comentar
    //Obtener todas las conversaciones en las que el usuario haya tomado parte como interesado
    app.get("/api/conversaciones/interesado", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403); // Forbidden
                app.get("logger").info('API: No se pudo acceder a las conversaciones como interesado debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                let usuario = infoToken.usuario;
                console.log("obteniendo las conversaciones como interesado para el usuario " + usuario);
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
                        app.get("logger").info("API: Conversaciones obtenidas con éxito");
                        res.send(JSON.stringify(conversaciones));
                    }
                });
            }
        });
    });

    //TODO comentar
    //Obtener todas las conversaciones en las que el usuario haya tomado parte
    app.get("/api/conversaciones/propietario", function (req, res) {
        console.log("obteniendo las conversaciones como propietario para el usuario " + req.session.usuario);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403); // Forbidden
                app.get("logger").info('API: No se pudo acceder a las conversaciones como propietario debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
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
                        app.get("logger").info("API: Conversaciones obtenidas con éxito");
                        console.log(JSON.stringify(conversaciones));
                        res.send(JSON.stringify(conversaciones));
                    }
                });
            }
        });
    });

    //TODO comentar
    //Obtener todos los mensajes de una conversación dada
    app.get("/api/mensajes/conv/:conversacion", function (req, res) {
        console.log("obteniendo los mensajes de la conversación " + req.params.conversacion);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403);
                app.get("logger").info('API: Error al obtener los mensajes de la conversación debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                var conversacion = req.params.conversacion;
                //En este caso basta con que el usuario esté involucrado en la conversación, sin importar el rol
                console.log("buscando mensajes de la conversación " + conversacion);
                let criterio_conversacion = {
                    "_id": gestorChat.mongo.ObjectID(conversacion),
                    $or:
                        [{"usuario1": infoToken.usuario}, {"usuario2": infoToken.usuario}]
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
                                app.get("logger").info("API: Mensajes obtenidos con éxito");
                                res.status(200);
                                console.log("mensajes obtenidos");
                                console.log(JSON.stringify(mensajes));
                                res.send(JSON.stringify(mensajes));
                            }
                        });
                    }
                });
            }
        });
    });

    //TODO comentar
    //Eliminar un mensaje determinado
    app.get("/api/mensajes/eliminar/:id", function (req, res) {
        console.log("eliminando mensaje " + req.params.id);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403);
                app.get("logger").info('API: Error al eliminar el mensaje de la conversación debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                let criterio_mensaje = {"_id": gestorChat.mongo.ObjectID(req.params.id)};
                gestorChat.obtenerMensajes(criterio_mensaje, function (mensaje) {
                    if (mensaje === null) {
                        res.status(501);
                        res.json({
                            error: "El mensaje a eliminar no se ha encontrado"
                        });
                    } else {
                        let criterio_conversacion = {"_id": gestorChat.mongo.ObjectID(mensaje[0].conversacion)};
                        gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                            if (conversaciones === null) {
                                res.status(501);
                                res.json({
                                    error: "Se produjo un error al obtener las conversaciones de la BBDD"
                                });
                            } else {
                                let criterio_involucrado = {
                                    "_id": gestorChat.mongo.ObjectID(mensaje[0].conversacion),
                                    $or:
                                        [{"usuario1": infoToken.usuario}, {"usuario2": infoToken.usuario}]
                                };
                                gestorChat.obtenerConversacion(criterio_involucrado, function (conver) {
                                    if (conver == null) {
                                        res.status(501);
                                        res.json({
                                            error: "Se produjo un error al obtener las conversaciones de la BBDD"
                                        })
                                    } else {
                                        app.get("logger").info("API: Mensajes obtenidos con éxito");
                                        if(conver.length > 0){
                                            gestorChat.eliminarMensaje(criterio_mensaje, function (mensaje) {
                                                if (mensaje === null) {
                                                    res.status(501);
                                                    res.json({
                                                        error: "El mensaje a eliminar no se ha encontrado"
                                                    });
                                                } else {
                                                    app.get("logger").info("API: Mensaje " + req.params.id + " eliminado con éxito");
                                                    res.status(200);
                                                    console.log("El mensaje " + req.params.id + " se eliminó con éxito");
                                                    res.send(JSON.stringify(mensaje));
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    //TODO comentar
    //Obtener todos los mensajes de una conversación dada
    app.get("/api/conversaciones/eliminar/:id", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403);
                app.get("logger").info('API: Error al eliminar los mensajes de la conversación debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                //En este caso basta con que el usuario esté involucrado en la conversación, sin importar el rol
                let criterio_conversacion = {
                    "_id": gestorChat.mongo.ObjectID(req.params.id),
                    $or:
                        [{"usuario1": infoToken.usuario}, {"usuario2": infoToken.usuario}]
                };
                console.log("eliminando conversación " + req.params.id);
                //TODO comprobar que es propietario el usuario que elimina con el token
                gestorChat.eliminarConversacion(criterio_conversacion, function (mensaje) {
                    if (mensaje === null) {
                        res.status(501);
                        res.json({
                            error: "La conversación a eliminar no se ha encontrado"
                        });
                    } else {
                        app.get("logger").info("API: Conversación eliminada correctamente");
                        res.status(200);
                        console.log("Conversación eliminada correctamente");
                        res.send(JSON.stringify(mensaje));
                    }
                });
            }
        });
    });

    //TODO comentar
    //Marcar como leído un mensaje determinado
    app.put("/api/mensajes/marcarleido/:id", function(req, res) {
        console.log("marcando como leído mensaje " + req.params.id);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403);
                app.get("logger").info('API: Error al marcar como leído el mensaje debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                let criterio_mensaje = {"_id": gestorChat.mongo.ObjectID(req.params.id)};
                gestorChat.obtenerMensajes(criterio_mensaje, function (mensaje) {
                    if (mensaje === null) {
                        res.status(501);
                        res.json({
                            error: "El mensaje a eliminar no se ha encontrado"
                        });
                    } else {
                        let criterio_conversacion = {"_id": gestorChat.mongo.ObjectID(mensaje[0].conversacion)};
                        gestorChat.obtenerConversacion(criterio_conversacion, function (conversaciones) {
                            if (conversaciones === null) {
                                res.status(501);
                                res.json({
                                    error: "Se produjo un error al obtener las conversaciones de la BBDD"
                                });
                            } else {
                                let criterio_involucrado = {
                                    "_id": gestorChat.mongo.ObjectID(conversaciones[0]._id),
                                    $or:
                                        [{"usuario1": infoToken.usuario}, {"usuario2": infoToken.usuario}]
                                };
                                gestorChat.obtenerConversacion(criterio_involucrado, function (conver) {
                                    if (conver == null) {
                                        res.status(501);
                                        res.json({
                                            error: "Se produjo un error al obtener las conversaciones de la BBDD"
                                        })
                                    } else {
                                        if (conver.length > 0) {
                                            //Cambiamos aquí
                                            let mensaje_leido = {"leido": true};
                                            gestorChat.cambiarEstadoMensaje(criterio_mensaje, mensaje_leido, function (result) {
                                                if (result == null) {
                                                    res.status(500);
                                                    res.json({
                                                        error: "Se produjo un error al marcar el mensaje como leído"
                                                    })
                                                } else {
                                                    app.get("logger").info("API: Mensaje marcado como leído correctamente");
                                                    res.status(200);
                                                    res.json({
                                                        mensaje: "Mensaje marcado como leído correctamente",
                                                        _id: req.params.id
                                                    })
                                                }
                                            });
                                        } else {
                                            res.status(200);
                                            res.json({
                                                error: "El mensaje a marcar como leído no se pudo encontrar"
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });


    //TODO comentar
    //Obtener el número de mensajes no leídos para un usuario y una conversación determinados
    app.get("/api/conversaciones/noleidos/:idConversacion", function (req, res) {
        console.log("obteniendo número de no leídos para la conver " + req.params.idConversacion);
        let token = req.headers['token'] || req.body.token || req.query.token;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err) {
                res.status(403); // Forbidden
                app.get("logger").info('API: No se pudo obtener el número de mensajes no leídos debido a un token inválido');
                res.json({
                    acceso: false,
                    error: 'Token inválido o caducado'
                });
            } else {
                let usuario = infoToken.usuario;
                var conversacion = req.params.idConversacion;
                let criterio_conv = {
                    _id: gestorProductos.mongo.ObjectID(conversacion)
                };
                gestorChat.obtenerConversacion(criterio_conv, function (conversacionRes) {
                    if (conversacionRes === null) {
                        res.status(501);
                        res.json({
                            error: "La conversación no se ha encontrado"
                        });
                    } else {
                        let criterio_mensajes = {
                            conversacion: gestorProductos.mongo.ObjectID(conversacionRes[0]._id),
                            emisor: {$nin: [usuario]},
                            "leido": false
                        };

                        gestorChat.obtenerMensajes(criterio_mensajes, function (mensajesNoLeidos) {
                            if (mensajesNoLeidos === null) {
                                res.status(501);
                                res.json({
                                    error: "Los mensajes no se han podido encontrar"
                                });
                            } else {
                                app.get("logger").info("API: Obtenido número de no leídos correctamente");
                                res.status(200);
                                //console.log("Obtenido número de no leídos correctamente");
                                //console.log(mensajesNoLeidos);
                                res.send(JSON.stringify(mensajesNoLeidos));
                            }
                        });
                    }
                });
            }
        });
    });
}