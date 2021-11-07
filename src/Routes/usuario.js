const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
var claveusu = 'As7cnuLSSGkw85A8SdrDJmqLHsSJAfqd';
var clavedoc = 'S:sVw>SN?j75zcA#-q{YdZ_5#W{E=X2q';
var claveadmin = "72eV)'xL9}:NQ999X(MUFa$MTw]$zz;w";

function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '03042021',
        database: 'bdquetzual',
        multipleStatements: true
        });
    mysqlConnection.connect(function (err) {
        if (err) {
          console.error(err);
          return;
        } else {
            console.log("Se concecto www");
        }
      });
    return mysqlConnection;
}

router.post('/Registrar/Usuario/Estudiante',(req, res) => {
    const {Nombre, correo, contra, fecha, genero, Clave} = req.body;
    if( Clave === claveusu){
        var  mysqlConnection = conectar();
        const queryy= 'select * from musuario where email_usu = ?';
        mysqlConnection.query(queryy, correo, (_error, _rowws, _fields) =>{
            if(!_error) {
                if(_rowws.length === 0){
                    const query = `insert into musuario (nom_usu, fecha_nac, email_usu, contra_usu, id_gen, id_rol, habilitada) VALUES (?,?,?,?,?,?,?) `;
                    mysqlConnection.query(query, [Nombre,  fecha, correo, contra, genero, 1, 1 ], (err, _rows, _fields) => {
                    if(!err) {
                        mysqlConnection.query('select id_usu from musuario where email_usu = ?', correo, (errr, rowss, _fields) =>{
                            if(!errr){
                                if(rowss.length > 0){
                                    var id= rowss[0].id_usu;
                                    mysqlConnection.query('insert into EUsuario (id_EnUsuario, id_usu) VALUES (?, ?)', [id, id],(errrr, _rows, _fields) =>{
                                        if(!errrr){
                                            mysqlConnection.commit();
                                            mysqlConnection.destroy();
                                            res.json({'status': 'Se ha guardado el Usuario'});
                                        }else{
                                            console.log(errrr);
                                            mysqlConnection.destroy();
                                            res.json({'status': '¡ERROR!'});
                                        }
                                    } );
                                }else{
                                    mysqlConnection.destroy();
                                    res.json({'status': '¡ERROR!'});
                                }
                            }else{
                                console.log(errr);
                                mysqlConnection.destroy();
                                res.json({'status': '¡ERROR!'});
                            }
                        });
                        } else {
                            console.log(err);
                            mysqlConnection.destroy();
                            res.json({'status': '¡ERROR!'});
                        }
                            });
                }else {
                    mysqlConnection.destroy();
                    res.json({'status': '¡ERROR!'});
                }

            } else {
                console.error(_error);
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'});
    }
  });

  router.post('/Registrar/Usuario/Doctor',(req, res) => {
    const {Nombre, correo, contra, fecha, genero, Clave} = req.body;
    if( Clave === claveadmin){
        var  mysqlConnection = conectar();
        const queryy= 'select * from musuario where email_usu = ?';
        mysqlConnection.query(queryy, correo, (_error, _rowws, _fields) =>{
            if(!_error) {
                if(_rowws.length === 0){
                    const query = `insert into musuario (nom_usu, fecha_nac, email_usu, contra_usu, id_gen, id_rol, habilitada) VALUES (?,?,?,?,?,?,?) `;
                    mysqlConnection.query(query, [Nombre,  fecha, correo, contra, genero, 2, 1 ], (err, _rows, _fields) => {
                    if(!err) {
                        mysqlConnection.query('select id_usu from musuario where email_usu = ?', correo, (errr, rowss, _fields) =>{
                            if(!errr){
                                if(rowss.length > 0){
                                    var id= rowss[0].id_usu;
                                    mysqlConnection.query('insert into EUsuario (id_EnUsuario, id_usu) VALUES (?, ?)', [id, id],(errrr, _rows, _fields) =>{
                                        if(!errrr){
                                            mysqlConnection.commit();
                                            mysqlConnection.destroy();
                                            res.json({'status': 'Se ha guardado el Usuario'});
                                        }else{
                                            console.log(errrr);
                                            mysqlConnection.destroy();
                                            res.json({'status': '¡ERROR!'});
                                        }
                                    } );
                                }else{
                                    mysqlConnection.destroy();
                                    res.json({'status': '¡ERROR!'});
                                }
                            }else{
                                console.log(errr);
                                mysqlConnection.destroy();
                                res.json({'status': '¡ERROR!'});
                            }
                        });
                        } else {
                            console.log(err);
                            mysqlConnection.destroy();
                            res.json({'status': '¡ERROR!'});
                        }
                            });
                }else {
                    mysqlConnection.destroy();
                    res.json({'status': '¡ERROR!'});
                }

            } else {
                console.error(_error);
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'});
    }
  });

router.post("/Iniciar/Sesion/Validar", (req, res) =>{
    const {correo, contra} = req.body;
    var  mysqlConnection = conectar();
    const query = 'select * from musuario where email_usu = ? and contra_usu = ? and habilitada = 1';
    mysqlConnection.query(query, [correo, contra], (_error, _rowws, _fields) =>{
        if(!_error){
            if(_rowws.length > 0){
                res.json({
                    'status': 'Se ha iniciado Sesion',
                    'usuario': _rowws
                });
            }else{
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'});
            }
        }else{
            console.error(_error);
            mysqlConnection.destroy();
            res.json({'status': '¡ERROR!'});
        }
    });
});


router.post('/Modificar/Usuario', (req, res) => {
    const {id, correo, fecha, nombre, id_gen, clave, rol}= req.body;
    if(( rol == 1 && clave == claveusu) || ( rol == 2 && clave == claveadmin) || ( rol == 3 && clave == claveadmin)   ){
        var mysqlConnection = conectar();
        const query = "Select id_usu from musuario where email_usu = ?";
        mysqlConnection.query(query, correo, (err, rows, fields)=>{
            if(!err){
                if(rows.length > 0){
                    if(rows[0].id_usu == id){
                        const query2 = "update musuario set nom_usu = ? , fecha_nac = ? , id_gen = ? where id_usu = ? ";
                        mysqlConnection.query(query2, [nombre, fecha, id_gen, id], (_error, _rows, _fields) =>{
                            if(!_error){
                                mysqlConnection.destroy();
                                res.json({'status': 'Cambio Guardado'})
                            }else{
                                console.error(_error);
                                mysqlConnection.destroy();
                                res.json({'status': '¡ERROR!'})
                            }
                        });
                    }else{
                        mysqlConnection.destroy();
                        res.json({'status': '¡ERROR!'})
                    }
                }else{
                    const query2 = "update musuario set nom_usu = ? , fecha_nac = ? , email_usu = ? , id_gen = ? where id_usu = ? ";
                    mysqlConnection.query(query2, [nombre, fecha, correo, id_gen, id], (_error, _rows, _fields) =>{
                        if(!_error){
                            mysqlConnection.destroy();
                            res.json({'status': 'Cambio Guardado'})
                        }else{
                            console.error(_error);
                            mysqlConnection.destroy();
                            res.json({'status': '¡ERROR!'})
                        }
                    });
                }
            }else{
                console.error(err);
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Modificar/Password', (req, res) => {
    const {id, rol, clave, pass} = req.body;
    if(( rol == 1 && clave == claveusu) || ( rol == 3 && clave == claveadmin)){
        var mysqlConnection = conectar();
        const query = "update musuario set contra_usu = ? where id_usu = ?";
        mysqlConnection.query(query, [pass, id], (err, rows, fields) => {
            if(!err){
                mysqlConnection.destroy();
                res.json({'status': 'Cambio Realizado'});
            }else{
                console.error(err);
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Eliminar/Estudiante', (req, res) =>{
    const{id, clave, rol} = req.body;
    if(rol == 1 && clave == claveusu){
        var mysqlConnection = conectar();
        const query = "update musuario set habilitada = ? , nom_usu = ? , email_usu = ? where id_usu = ? and id_rol = ? ";
        mysqlConnection.query(query, [0,'Usuario Elimado', 'Usuario Eliminado', id , 1], (err, rows, fields) =>{
            if(!err){
                mysqlConnection.destroy();
                res.json({'status': 'Cuenta Eliminada'});
            }else{
                console.error(err);
                mysqlConnection.destroy();
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Obtener/Doctores' , (req, res) => {
    const {clave} = req.body;
    if(clave == claveadmin){
        var mysqlConnection = conectar();
        const query = "select nom_usu, email_usu, fecha_nac, id_usu, id_gen from musuario where id_rol = ? and habilitada = ?";
        mysqlConnection.query(query, [2, 1], (err, rows, field)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontrados',
                    'datos': rows });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Obtener/Doctores/rank' , (req, res) => {
    const {clave} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection = conectar();
        const query = "select nom_usu, id_usu from musuario where id_rol = ? ";
        mysqlConnection.query(query, [2], (err, rows, field)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontrados',
                    'datos': rows });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Deshabilitar/Doctor', (req, res) =>{
    const {clave, id} = req.body;
    if(clave == claveadmin){
        var mysqlConnection = conectar();
        const query = 'update musuario set habilitada = ?, email_usu = ? where id_usu = ? and id_rol = ?';
        mysqlConnection.query(query, [0, "Doctor Deshabilitado" , id, 2], (err, rows, fields)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({'status': 'Cuenta Deshabilitada'})
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Progreso/General', (req, res) => {
    const {clave} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection  = conectar();
        const query = "Select dcalires.cal , mrespuesta.id_cat from dcalires INNER JOIN MRespuesta ON dcalires.id_res = mrespuesta.id_res";
        mysqlConnection.query(query, (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontrados',
                    'datos': rows });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Progreso/Usuario/Calificaciones', (req, res) => {
    const {clave, id} = req.body;
    if(clave == claveusu){
        var mysqlConnection  = conectar();
        const query = "Select dcalires.cal , mrespuesta.id_cat from dcalires INNER JOIN MRespuesta ON dcalires.id_res = mrespuesta.id_res where dcalires.id_usuC = ?";
        mysqlConnection.query(query, [id], (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontrados',
                    'datos': rows });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'})
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});


router.post('/Progreso/Estudiante/Preguntas', (req, res)=>{
    const {clave, id} = req.body;
    if(clave == claveusu){
        var mysqlConnection  = conectar();
        const query = 'Select id_estado from mpregunta where (id_estado = 3 OR id_estado = 2) AND id_usup= ? ';
        mysqlConnection.query(query, [id], (err, rows)=>{
            if(!err){
                if(rows.length >0){
                    var respondidas = 0;
                    var rechazadas = 0;
                    for(var i = 0; i<rows.length ; i++){
                        if(rows[i].id_estado == 2) {
                            respondidas += 1;
                        }else if(rows[i].id_estado == 3){
                            rechazadas += 1;
                            }
                    }
                    mysqlConnection.destroy();
                    res.json({
                        'status': 'Preguntas encontradas',
                        'respondidas': respondidas,
                        'rechazadas': rechazadas
                    });
                }else{
                    mysqlConnection.destroy();
                    res.json({'status': 'No se ha encontrado preguntas'});
                }
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Ranking/Historico', (req, res)=>{
    const{clave, id} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection = conectar();
        const query = 'select cant_punt from Puntos where id_usudoc = ?';
        mysqlConnection.query(query, id, (err, rows)=>{
            if(!err){
                if(rows.length > 0){
                    var total = 0;
                    for(var i = 0; i<rows.length ; i++){
                        total += parseInt(rows[i].cant_punt) ;
                    }
                    mysqlConnection.destroy();
                    res.json({
                        'status': 'Datos',
                        'total': total               
                    });
                }else{
                    mysqlConnection.destroy();
                    res.json({
                        'status': 'Datos',
                        'total': 0                
                    });
                }
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Ranking/Mensual', (req, res)=>{
    const{clave, mes} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection = conectar();
        console.log(mes)
        const query = 'select musuario.nom_usu, puntos.cant_punt from EUsuario INNER JOIN MUsuario ON Eusuario.id_usu = musuario.id_usu INNER JOIN Puntos ON puntos.id_usudoc = eusuario.id_EnUsuario where Puntos.mes_punt = ? order by puntos.cant_punt desc';
        mysqlConnection.query(query, [mes], (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                console.table(rows)
                res.json({
                    'status': 'Encontradas',
                    'datos': rows
                });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

router.post('/Consultar/Doctor', (req, res)=>{
    const{clave, id} = req.body;
    if(clave == claveadmin ){
        var mysqlConnection = conectar();
        const query = 'select * from musuario where id_usu = ? and id_rol = ?';
        mysqlConnection.query(query, [id, 2], (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontradas',
                    'datos': rows
                });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '¡ERROR!'});
            }
        });
    }else{
        res.json({'status': '¡ERROR!'})
    }
});



module.exports = router;