module.exports = function (app, gestorUsuarios, gestorProductos, gestorChat) {

    /**
     * Método Get para eliminar los datos de la base de datos y mantener un estado consistente a la hora de realizar
     * las pruebas. Se eliminan los mensajes, conversaciones, productos y usuarios.
     */
    app.get("/api/test/eliminar", function (req, res) {
        gestorChat.eliminarMensaje({}, function (mensajes) {
            gestorChat.eliminarConversacion({}, function (conversaciones) {
                gestorProductos.eliminarProducto({}, function (productos) {
                    gestorUsuarios.eliminarUsuario({}, function (usuarios) {
                        res.redirect("/")
                    });
                });
            });
        });
    });

    /**
     * Método Get para insertar los datos por defecto en la base de datos a la hora de realizar los tests.
     * Se insertan usuaarios, productos, conversaciones y mensajes.
     */
    app.get("/api/test/datos/insertar", function (req, res) {
            var usuario_1_eliminar = {
                email: "usuario_1_eliminar@email.com",
                nombre: "usuario1",
                apellidos: "apellidos usuario 1",
                password: app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update("password").digest('hex'),
                isAdmin: false,
                saldo: parseFloat("100")
            };
            gestorUsuarios.insertarUsuario(usuario_1_eliminar, function (usuario) {
                    if (usuario == null) {
                        send("Error pruebas");
                    } else {
                        var usuario_2_eliminar = {
                            email: "usuario_2_eliminar@email.com",
                            nombre: "usuario1",
                            apellidos: "apellidos usuario 1",
                            password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                .update("password").digest('hex'),
                            isAdmin: false,
                            saldo: parseFloat("100")
                        };
                        gestorUsuarios.insertarUsuario(usuario_2_eliminar, function (usuario) {
                            if (usuario == null) {
                                send("Error pruebas");
                            } else {

                                var usuario_3_eliminar = {
                                    email: "usuario_3_eliminar@email.com",
                                    nombre: "usuario1",
                                    apellidos: "apellidos usuario 1",
                                    password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                        .update("password").digest('hex'),
                                    isAdmin: false,
                                    saldo: parseFloat("100")
                                };
                                gestorUsuarios.insertarUsuario(usuario_3_eliminar, function (usuario) {
                                    if (usuario == null) {
                                        send("Error pruebas");
                                    } else {

                                        var usuario_4_eliminar = {
                                            email: "usuario_4_eliminar@email.com",
                                            nombre: "usuario1",
                                            apellidos: "apellidos usuario 1",
                                            password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                .update("password").digest('hex'),
                                            isAdmin: false,
                                            saldo: parseFloat("100")
                                        };
                                        gestorUsuarios.insertarUsuario(usuario_4_eliminar, function (usuario) {
                                            if (usuario == null) {
                                                send("Error pruebas");
                                            } else {

                                                var usuario_1 = {
                                                    email: "u1@email.com",
                                                    nombre: "usuario1",
                                                    apellidos: "apellidos usuario 1",
                                                    password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                        .update("password").digest('hex'),
                                                    isAdmin: false,
                                                    saldo: parseFloat("100")
                                                };
                                                gestorUsuarios.insertarUsuario(usuario_1, function (usuario) {
                                                    if (usuario == null) {
                                                        send("Error pruebas");
                                                    } else {
                                                        var usuario_2 = {
                                                            email: "u2@email.com",
                                                            nombre: "usuario 2",
                                                            apellidos: "apellidos usuario 2",
                                                            password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                                .update("password").digest('hex'),
                                                            isAdmin: false,
                                                            saldo: parseFloat("100")
                                                        };
                                                        gestorUsuarios.insertarUsuario(usuario_2, function (usuario) {
                                                            if (usuario == null) {
                                                                send("Error pruebas");
                                                            } else {
                                                                var usuario_3 = {
                                                                    email: "u3@email.com",
                                                                    nombre: "usuario 3",
                                                                    apellidos: "apellidos usuario 3",
                                                                    password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                                        .update("password").digest('hex'),
                                                                    isAdmin: false,
                                                                    saldo: parseFloat("100")
                                                                };
                                                                gestorUsuarios.insertarUsuario(usuario_3, function (usuario) {
                                                                    if (usuario == null) {
                                                                        send("Error pruebas");
                                                                    } else {
                                                                        var usuario_4 = {
                                                                            email: "u4@email.com",
                                                                            nombre: "usuario 4",
                                                                            apellidos: "apellidos usuario 4",
                                                                            password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                                                .update("password").digest('hex'),
                                                                            isAdmin: false,
                                                                            saldo: parseFloat("100")
                                                                        };
                                                                        gestorUsuarios.insertarUsuario(usuario_4, function (usuario) {
                                                                            if (usuario == null) {
                                                                                send("Error pruebas");
                                                                            } else {
                                                                                var usuario_5 = {
                                                                                    email: "admin@email.com",
                                                                                    nombre: "admin",
                                                                                    apellidos: "apellidos admin",
                                                                                    password: app.get("crypto").createHmac('sha256', app.get('clave'))
                                                                                        .update("admin").digest('hex'),
                                                                                    isAdmin: true,
                                                                                    saldo: 100
                                                                                };
                                                                                gestorUsuarios.insertarUsuario(usuario_5, function (usuario) {
                                                                                    if (usuario == null) {
                                                                                        res.send("Error pruebas");
                                                                                    } else {

                                                                                        var producto_1 = {
                                                                                            nombre: "Funko Pop",
                                                                                            descripcion: "Chorrada",
                                                                                            precio: 12,
                                                                                            fecha: new Date(),
                                                                                            propietario: "u1@email.com",
                                                                                            comprador: null,
                                                                                            destacada: false
                                                                                        }
                                                                                        gestorProductos.insertarProducto(producto_1, function (producto) {
                                                                                            if (producto == null) {
                                                                                                res.send("Error pruebas");
                                                                                            } else {
                                                                                                var producto_2 = {
                                                                                                    nombre: "Jabulani",
                                                                                                    descripcion: "Resbala",
                                                                                                    precio: 100,
                                                                                                    fecha: new Date(),
                                                                                                    propietario: "u2@email.com",
                                                                                                    comprador: null,
                                                                                                    destacada: false
                                                                                                }
                                                                                                gestorProductos.insertarProducto(producto_2, function (producto) {
                                                                                                    if (producto == null) {
                                                                                                        res.send("Error pruebas");
                                                                                                    } else {
                                                                                                        var producto_3 = {
                                                                                                            nombre: "Nintendo DS",
                                                                                                            descripcion: "Incluye stylus",
                                                                                                            precio: 3,
                                                                                                            fecha: new Date(),
                                                                                                            propietario: "u3@email.com",
                                                                                                            comprador: "u1@email.com",
                                                                                                            destacada: false
                                                                                                        }
                                                                                                        gestorProductos.insertarProducto(producto_3, function (producto) {
                                                                                                            if (producto == null) {
                                                                                                                res.send("Error pruebas");
                                                                                                            } else {
                                                                                                                var producto_4 = {
                                                                                                                    nombre: "Cascos inalámbricos",
                                                                                                                    descripcion: "Genéricos",
                                                                                                                    precio: 101,
                                                                                                                    fecha: new Date(),
                                                                                                                    propietario: "u1@email.com",
                                                                                                                    comprador: "u4@email.com",
                                                                                                                    destacada: false
                                                                                                                }
                                                                                                                gestorProductos.insertarProducto(producto_4, function (producto) {
                                                                                                                    if (producto == null) {
                                                                                                                        res.send("Error pruebas");
                                                                                                                    } else {
                                                                                                                        var producto_5 = {
                                                                                                                            nombre: "Bucket hat",
                                                                                                                            descripcion: "Gilligan",
                                                                                                                            precio: 10,
                                                                                                                            fecha: new Date(),
                                                                                                                            propietario: "u2@email.com",
                                                                                                                            comprador: "u3@email.com",
                                                                                                                            destacada: false
                                                                                                                        }
                                                                                                                        gestorProductos.insertarProducto(producto_5, function (producto) {
                                                                                                                            if (producto == null) {
                                                                                                                                res.send("Error pruebas");
                                                                                                                            } else {
                                                                                                                                var producto_6 = {
                                                                                                                                    nombre: "Altavoz inalámbrico",
                                                                                                                                    descripcion: "Seminuevo",
                                                                                                                                    precio: 50,
                                                                                                                                    fecha: new Date(),
                                                                                                                                    propietario: "u3@email.com",
                                                                                                                                    comprador: null,
                                                                                                                                    destacada: false
                                                                                                                                }
                                                                                                                                gestorProductos.insertarProducto(producto_6, function (producto) {
                                                                                                                                    if (producto == null) {
                                                                                                                                        res.send("Error pruebas");
                                                                                                                                    } else {
                                                                                                                                        var producto_7 = {
                                                                                                                                            nombre: "Mochila",
                                                                                                                                            descripcion: "Como nueva",
                                                                                                                                            precio:88,
                                                                                                                                            fecha: new Date(),
                                                                                                                                            propietario: "u4@email.com",
                                                                                                                                            comprador: null,
                                                                                                                                            destacada: false
                                                                                                                                        }
                                                                                                                                        gestorProductos.insertarProducto(producto_7, function (producto) {
                                                                                                                                            if (producto == null) {
                                                                                                                                                res.send("Error pruebas");
                                                                                                                                            } else {
                                                                                                                                                var producto_8 = {
                                                                                                                                                    nombre: "iPad",
                                                                                                                                                    descripcion: "Seminuevo, solo un par de roces",
                                                                                                                                                    precio: 2,
                                                                                                                                                    fecha: new Date(),
                                                                                                                                                    propietario: "u3@email.com",
                                                                                                                                                    comprador: null,
                                                                                                                                                    destacada: false
                                                                                                                                                }
                                                                                                                                                gestorProductos.insertarProducto(producto_8, function (producto) {
                                                                                                                                                    if (producto == null) {
                                                                                                                                                        res.send("Error pruebas");
                                                                                                                                                    } else {

                                                                                                                                                        var conversacion_1 = {
                                                                                                                                                            "usuario1": "u1@email.com",
                                                                                                                                                            "usuario2": "u3@email.com",
                                                                                                                                                            "producto": producto.toString()
                                                                                                                                                        };
                                                                                                                                                        gestorChat.insertarConversacion(conversacion_1, function (conversacion) {
                                                                                                                                                            if (conversacion === null) {
                                                                                                                                                                res.send("Error pruebas");
                                                                                                                                                            } else {
                                                                                                                                                                var mensaje_1 = {
                                                                                                                                                                    "emisor": "u1@email.com",
                                                                                                                                                                    "texto": "Mensaje por el iPad",
                                                                                                                                                                    "leido": false,
                                                                                                                                                                    "fecha": new Date(),
                                                                                                                                                                    "conversacion": conversacion
                                                                                                                                                                };
                                                                                                                                                                gestorChat.insertarMensaje(mensaje_1, function (mensaje) {
                                                                                                                                                                    if (mensaje === null) {
                                                                                                                                                                        res.send("Error pruebas");
                                                                                                                                                                    } else {
                                                                                                                                                                        var mensaje_2 = {
                                                                                                                                                                            "emisor": "u3@email.com",
                                                                                                                                                                            "texto": "Hola, está en perfecto estado",
                                                                                                                                                                            "leido": false,
                                                                                                                                                                            "fecha": new Date(),
                                                                                                                                                                            "conversacion": conversacion
                                                                                                                                                                        };
                                                                                                                                                                        gestorChat.insertarMensaje(mensaje_2, function (mensaje) {
                                                                                                                                                                            if (mensaje === null) {
                                                                                                                                                                                res.send("Error pruebas");
                                                                                                                                                                            } else {
                                                                                                                                                                                var mensaje_3 = {
                                                                                                                                                                                    "emisor": "u1@email.com",
                                                                                                                                                                                    "texto": "Vale, todo correcto entonces",
                                                                                                                                                                                    "leido": false,
                                                                                                                                                                                    "fecha": new Date(),
                                                                                                                                                                                    "conversacion": conversacion
                                                                                                                                                                                };
                                                                                                                                                                                gestorChat.insertarMensaje(mensaje_3, function (mensaje) {
                                                                                                                                                                                    if (mensaje === null) {
                                                                                                                                                                                        res.send("Error pruebas");
                                                                                                                                                                                    } else {
                                                                                                                                                                                        res.redirect("/");
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
                    }
                }
            )
            ;
        }
    )
    ;
}
