const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
var claveusu = 'As7cnuLSSGkw85A8SdrDJmqLHsSJAfqd';
var clavedoc = 'S:sVw>SN?j75zcA#-q{YdZ_5#W{E=X2q';
const config = 'S~J?xm,:c7WU8HFz)K$a$N&[V:ez*EN#';
const fs = require('fs');

function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: process.env.BD_HOST || '127.0.0.1',
        user: process.env.BD_USER ||'juanv',
        password: process.env.BD_PASS ||'JuanVasco22$',
        database: process.env.BD_NAME ||'BDQuetzual',
        port: 3306,
        charset: 'UTF8_GENERAL_CI'
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
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveusu && tokend.clave == claveusu && tokend.id == usu && tokend.id_rol == 1){
                var mysqlConnection = conectar();
                const query = 'insert into MPregunta (des_pre, Fecha_pre, id_usup, id_estado) VALUES (?, ?, ?, ?)';
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
    }
});

//requiere token
router.post('/Modificar/Pregunta/Pendiente', (req, res) =>{
    const {pregunta, clave, fecha, usu, id_pre} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveusu && tokend.id_rol == 1 && tokend.id == usu && tokend.clave == claveusu){
                var mysqlConnection = conectar();
                const query = 'update MPregunta set des_pre = ? , Fecha_pre = ? where id_pre = ? AND id_usup = ? AND id_estado = ?';
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
    }
});

//requiere token
router.post('/Eliminar/Pregunta', (req, res)=>{
    const {clave, pregunta, id_usu} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        if(seguirrr){
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
    }
});

//requiere token
router.post('/Usuario/Preguntas', (req, res)=>{
    const{id_usu, clave, estado} = req.body;
    const token = req.headers['token'];
    if(!token){
        res.json({'status': '¡ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveusu && id_usu == tokend.id && 1 == tokend.id_rol){
            
                var mysqlConnection = conectar();
                if(estado == 3){
                    const query = 'select MPregunta.des_pre , MPregunta.Fecha_pre , MRespuesta.des_res, MRespuesta.fecha_res  from MPregunta INNER JOIN MRespuesta ON MPregunta.id_pre = MRespuesta.id_pre where MPregunta.id_usup = ? AND MPregunta.id_estado = ? ';
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
                    const query = 'select * from MPregunta where id_usup = ? AND id_estado = ?';
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
    }
});


router.post('/Respondidas/Actuales', (req, res)=>{
    const {Clave} = req.body;
    if(Clave == claveusu || Clave == clavedoc){
        var mysqlConnection = conectar();
        const query = 'select MPregunta.id_pre, MPregunta.des_pre, MPregunta.Fecha_pre, MUsuario.fecha_nac from MPregunta INNER JOIN EUsuario ON MPregunta.id_usup = EUsuario.id_EnUsuario INNER JOIN MUsuario ON EUsuario.id_usu = MUsuario.id_usu where MPregunta.id_estado = ? ORDER BY MPregunta.id_pre DESC';
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
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '¡ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == clavedoc && tokend.id_rol == 2 && tokend.clave == clavedoc){
                var mysqlConnection = conectar();
                const query = 'select * from MPregunta where id_estado = 1';
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
    }
});

router.post('/Consultar/Pregunta', (req, res)=>{
    const{clave, id_pre} = req.body;
    if(clave == clavedoc || clave == claveusu){
        var mysqlConnection = conectar();
        const query = 'select * from MPregunta where id_pre = ? and id_estado = ?';
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
        const query = 'select MPregunta.id_pre, MPregunta.des_pre, MPregunta.Fecha_pre, MUsuario.fecha_nac from MPregunta INNER JOIN EUsuario ON MPregunta.id_usup = EUsuario.id_EnUsuario INNER JOIN MUsuario ON EUsuario.id_usu = MUsuario.id_usu where MPregunta.id_estado = ?';
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