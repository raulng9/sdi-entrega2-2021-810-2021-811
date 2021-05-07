module.exports = function(app, gestorProductos) {

    app.get("/api/ofertas", function(req, res) {

        //Solo aquellas aún disponibles
        let criterio = {
            //Operador para evitar mostrar los productos propios
            propietario : {$ne: res.usuario},
            comprador : null
        };


        gestorProductos.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "Error al obtener los productos de la API"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });
}
