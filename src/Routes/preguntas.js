const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
var claveusu = 'As7cnuLSSGkw85A8SdrDJmqLHsSJAfqd';
var clavedoc = 'S:sVw>SN?j75zcA#-q{YdZ_5#W{E=X2q';
const config = 'S~J?xm,:c7WU8HFz)K$a$N&[V:ez*EN#';

function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '03042021',
        database: 'bdquetzual',
        charset:  "utf-8",
        multipleStatements: true
        });
    mysqlConnection.connect(function (err) {
        if (err) {
          console.error(err);
          return;
        } 
      });
    return mysqlConnection;
}

//requiere token
router.post('/Realizar/Pregunta', (req, res)=>{
    const {pregunta, clave, fecha, usu, estado} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        try{
            const tokend = jwt.verify(token, config);
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        const tokend = jwt.verify(token, config);
        if(clave == claveusu && tokend.clave == claveusu && tokend.id == usu && tokend.id_rol == 1){
            var mysqlConnection = conectar();
            const query = 'insert into mpregunta (des_pre, fecha_pre, id_usup, id_estado) VALUES (?, ?, ?, ?)';
            mysqlConnection.query(query, [pregunta, fecha, usu, estado], (err, rows)=>{
                if(!err){
                    mysqlConnection.destroy();
                    res.json({'status': 'Guardado'});
                }else{
                    mysqlConnection.destroy();
                    console.error(err);
                    res.json({'status': '¡ERROR!'});
                }
            });
        }else{
            res.json({'status': '¡ERROR!'})
        }
    }
});

//requiere token
router.post('/Modificar/Pregunta/Pendiente', (req, res) =>{
    const {pregunta, clave, fecha, usu, id_pre} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        try{
            const tokend = jwt.verify(token, config);
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        const tokend = jwt.verify(token, config);
        if(clave == claveusu && tokend.id_rol == 1 && tokend.id == usu && tokend.clave == claveusu){
            var mysqlConnection = conectar();
            const query = 'update mpregunta set des_pre = ? , fecha_pre = ? where id_pre = ? AND id_usup = ? AND id_estado = ?';
            mysqlConnection.query(query, [pregunta, fecha, id_pre, usu, 1], (err, rows) =>{
                if(!err){
                    mysqlConnection.destroy();
                    res.json({'status': 'Actualizado'})
                }else{
                    mysqlConnection.destroy();
                    console.error(err);
                    res.json({'status': '¡ERROR!'});
                }
            } );
        }else{
            res.json({'status': '¡ERROR!'});
        }
    }
});

//requiere token
router.post('/Eliminar/Pregunta', (req, res)=>{
    const {clave, pregunta, id_usu} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        try{
            const tokend = jwt.verify(token, config);
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        const tokend = jwt.verify(token, config);
        if(clave == claveusu && tokend.id_rol == 1 && tokend.id == id_usu && tokend.clave == claveusu){
            var mysqlConnection = conectar();
            const query = 'delete from MPregunta where id_pre = ? AND id_usup = ? AND id_Estado = ?';
            mysqlConnection.query(query,[pregunta, id_usu, 1], (err, rows)=>{
                if(!err){
                    mysqlConnection.destroy();
                    res.json({'status': 'Eliminada'});
                }else{
                    mysqlConnection.destroy();
                    console.error(err);
                    res.json({'status': '¡ERROR!'});
                }
            });
        }else{
            res.json({'status': '¡ERROR!'})
        }
    }
});

//requiere token
router.post('/Usuario/Preguntas', (req, res)=>{
    const{id_usu, clave, estado} = req.body;
    const token = req.headers['token'];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        try{
            const tokend = jwt.verify(token, config);
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        const tokend = jwt.verify(token, config);
        if(clave == claveusu && id_usu == tokend.id && 1 == tokend.id_rol){
           
            var mysqlConnection = conectar();
            if(estado == 3){
                const query = 'select mpregunta.des_pre , mpregunta.fecha_pre , mrespuesta.des_res, mrespuesta.fecha_res  from mpregunta INNER JOIN mrespuesta ON mpregunta.id_pre = mrespuesta.id_pre where mpregunta.id_usup = ? AND mpregunta.id_estado = ? ';
                mysqlConnection.query(query, [id_usu, estado], (err, rows) =>{
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
            }else if(estado == 2 || estado == 1){
                const query = 'select * from mpregunta where id_usup = ? AND id_estado = ?';
                mysqlConnection.query(query, [id_usu, estado], (err, rows) =>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontradas',
                            'datos': rows
                        })
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '¡ERROR!'});
                    }
                });
            }
        }else{
            res.json({'status': '¡ERROR!'})
        }
    }
});


router.post('/Respondidas/Actuales', (req, res)=>{
    const {Clave, clasi} = req.body;
    if(Clave == claveusu || Clave == clavedoc){
        var mysqlConnection = conectar();
        if(clasi == 0 || clasi == 6){
            const query = 'select mpregunta.id_pre, mpregunta.des_pre, mpregunta.fecha_pre, musuario.fecha_nac from mpregunta INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mpregunta.id_estado = ? ORDER BY mpregunta.id_pre DESC';
            mysqlConnection.query(query, 2, (err, rows)=>{
                if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontrados',
                            'datos': rows
                    });
                }else{
                    mysqlConnection.destroy();
                    console.error(err);
                    res.json({'status': '¡ERROR!'});
                }
            });
        }else if(clasi < 6 && clasi>0){
            const query = 'select mpregunta.id_pre, mpregunta.des_pre, mpregunta.fecha_pre, musuario.fecha_nac from mpregunta INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mpregunta.id_estado = ? AND mrespuesta.id_cat = ? ORDER BY mpregunta.id_pre DESC';
            mysqlConnection.query(query, [2, clasi], (err, rows)=>{
                if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontrados',
                            'datos': rows
                    });
                }else{
                    mysqlConnection.destroy();
                    console.error(err);
                    res.json({'status': '¡ERROR!'});
                }
            });
        }
    }else{
        res.json({'status': '¡ERROR!'})
    }
});

//requiere token
router.post('/Pendientes', (req, res)=>{
    const {clave} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        try{
            const tokend = jwt.verify(token, config);
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        const tokend = jwt.verify(token, config);
        if(clave == clavedoc && tokend.id_rol == 2 && tokend.clave == clavedoc){
            var mysqlConnection = conectar();
            const query = 'select * from mpregunta where id_estado = 1';
            mysqlConnection.query(query, (err, rows)=>{
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
    }
});

router.post('/Consultar/Pregunta', (req, res)=>{
    const{clave, id_pre} = req.body;
    if(clave == clavedoc || clave == claveusu){
        var mysqlConnection = conectar();
        const query = 'select * from mpregunta where id_pre = ? and id_estado = ?';
        mysqlConnection.query(query, [id_pre, 1], (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                    res.json({
                        'status': 'Encontrados',
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

router.post('/Similares', (req, res)=>{
    const {clave, pre} = req.body;
    if(clave == claveusu){
        var mysqlConnection = conectar();
        const query = 'select mpregunta.id_pre, mpregunta.des_pre, mpregunta.fecha_pre, musuario.fecha_nac from mpregunta INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mpregunta.id_estado = ?';
        mysqlConnection.query(query, 2, (err, rows)=>{
            if(!err){
                var similares = [];
                const espacio = " ";
                var premi = pre.toLowerCase();
                const arrayDeCadenas = premi.split(espacio);
                for(var ij=0; ij<rows.length;ij++){
                    var cont = 0;
                    var des =  rows[ij].des_pre;
                    var desmi= des.toLowerCase();
                    const arrayDeRespuestas =desmi.split(espacio);
                    for (var i = 0; i < arrayDeCadenas.length; i++) {
                        for (var j = 0; j < arrayDeRespuestas.length; j++) {
                            if (arrayDeCadenas[i] == arrayDeRespuestas[j]) {
                                cont++;
                                break;
                            }
                        }
                    }
                    var porcentaje = cont / arrayDeCadenas.length;
                    porcentaje *= 100;
                    if (porcentaje > 49) {
                       similares.push(rows[ij]);
                    }
                }
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontradas',
                    'datos': similares
                })
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