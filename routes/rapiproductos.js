module.exports = function(app, gestorProductos) {

    app.get("/api/ofertas", function(req, res) {
        console.log("Aqui llega?");
        //Solo aquellas aún disponibles
        let criterio = {
            //Operador para evitar mostrar los productos propios
            propietario : {$nin: [req.session.usuario]},
            comprador : null
        };


        gestorProductos.obtenerProductos(criterio, function(productos) {
            console.log("Aqui?")
            if (productos == null) {
                res.status(500);
                console.log("Es aqui el problema");
                res.json({
                    error : "Error al obtener los productos de la API"
                })
            } else {
                res.status(200);
                console.log("Aqui tmb");
                res.send( JSON.stringify(productos) );
            }
        });
    });
}
