const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
var claveusu = 'As7cnuLSSGkw85A8SdrDJmqLHsSJAfqd';
var clavedoc = 'S:sVw>SN?j75zcA#-q{YdZ_5#W{E=X2q';
var claveadmin = "72eV)'xL9}:NQ999X(MUFa$MTw]$zz;w";
const config = 'S~J?xm,:c7WU8HFz)K$a$N&[V:ez*EN#';

function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: process.env.BD_HOST || 'localhost',
        user: process.env.BD_USER ||'root',
        password: process.env.BD_PASS ||'03042021',
        database: process.env.BD_NAME ||'bdquetzual',
        port: process.env.PORT || 3306,
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
router.post('/Pregunta/Rechazar', (req, res)=>{
    const{id_pre, id_doc, fecha, razon, clave } = req.body;
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
            if(clave == clavedoc && tokend.id_rol == 2 && tokend.clave == clavedoc && id_doc == tokend.id){
                var mysqlConnection = conectar();
                const query = 'update MPregunta set id_estado = ? where id_pre = ?  and id_estado = 1';
                mysqlConnection.query(query, [ 3, id_pre], (err, rows)=>{
                    if(!err){
                        const query2 = 'insert into MRespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
                        mysqlConnection.query(query2, [id_pre, razon, fecha, 6, id_doc], (_err, _rows)=>{
                            if(!_err){
                                mysqlConnection.destroy();
                                res.json({'status': 'Rechazada'})
                            }else{
                                mysqlConnection.destroy();
                                console.error(_err);
                                res.json({'status': '¡ERROR!'});
                            }
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

router.post('/Cantidad/Respuesta', (req, res)=>{
    const {id} = req.body;
    var mysqlConnection = conectar();
    const query = 'select id_cat from MRespuesta where id_pre = ?';
    mysqlConnection.query(query, id, (err, rows)=>{
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
});

router.post('/Promedio/Respuestas', (req, res)=>{
    const {id} = req.body;
    var mysqlConnection = conectar();
    const query = 'select cal from DCaliRes where id_res = ? ';
    mysqlConnection.query(query, id, (err, rows)=>{
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
});

//requiere token
router.post('/Historico/Doctor', (req, res)=>{
    const {id, clave} = req.body;
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
            if((clave == clavedoc && tokend.id == id && tokend.id_rol == 2 && tokend.clave == clavedoc )|| (clave ==  claveadmin && tokend.id_rol == 3 && tokend.clave == claveadmin )){
                var mysqlConnection = conectar();
                const query = 'select MPregunta.id_pre, MPregunta.id_estado, MPregunta.des_pre, MPregunta.Fecha_pre, MRespuesta.id_res, MRespuesta.des_res, MRespuesta.id_cat, MRespuesta.fecha_res, MUsuario.fecha_nac from MRespuesta INNER JOIN MPregunta ON MRespuesta.id_pre = MPregunta.id_pre INNER JOIN EUsuario ON MPregunta.id_usup = EUsuario.id_EnUsuario INNER JOIN MUsuario ON EUsuario.id_usu = MUsuario.id_usu where MRespuesta.id_usures = ?';
                mysqlConnection.query(query, id, (err, rows)=>{
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

//requiere token
router.post('/Pregunta/Responder', (req, res)=>{
    const{id_pre, id_doc, fecha, respuesta, pregunta, clave, categoria , Puntos} = req.body;
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
            if(clave == clavedoc && categoria < 6 && tokend.clave == clavedoc && tokend.id == id_doc && tokend.id_rol == 2){
                var mysqlConnection = conectar();
                const query = 'update MPregunta set des_pre = ? , id_estado = ? where id_pre = ?  and id_estado = 1';
                mysqlConnection.query(query, [pregunta, 2, id_pre], (err, rows)=>{
                    if(!err){
                        const query2 = 'insert into MRespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
                        mysqlConnection.query(query2, [id_pre, respuesta, fecha, categoria, id_doc], (_err, _rows)=>{
                            if(!_err){
                                var str = fecha.split("/");
                                var meses = str[1] +'/'+ str[2];
                                const query3 = 'select cant_punt, id_punt from Puntos where id_usudoc = ? AND mes_punt = ?';
                                mysqlConnection.query(query3, [id_doc, meses], (err_, rows_)=>{
                                    if(!err_){
                                        if(rows_.length >0){
                                            var Puntostotales = rows_[0].cant_punt + Puntos;
                                            const query4 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                            mysqlConnection.query(query4, [Puntostotales, rows_[0].id_punt], (_err_, _rows_)=>{
                                                if(!_err_){
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Pregunta Guardada'});
                                                }else{
                                                    mysqlConnection.destroy();
                                                    console.error(_err_);
                                                    res.json({'status': '¡ERROR!'});
                                                }
                                            });
                                        }else{
                                            const query5 = 'insert into Puntos (id_usudoc, mes_punt, cant_punt) VALUES (?, ?, ?)';
                                            mysqlConnection.query(query5, [id_doc, meses, Puntos], (_err_, _rows_)=>{
                                                if(!_err_){
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Pregunta Guardada'});
                                                }else{
                                                    mysqlConnection.destroy();
                                                    console.error(_err_);
                                                    res.json({'status': '¡ERROR!'});
                                                }
                                            });
                                        }
                                    }else{
                                        mysqlConnection.destroy();
                                        console.error(err_);
                                        res.json({'status': '¡ERROR!'});
                                    }
                                });
                            }else{
                                mysqlConnection.destroy();
                                console.error(_err);
                                res.json({'status': '¡ERROR!'});
                            }
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

//requiere token
router.post('/Responder/Pregunta/Respondida', (req, res)=>{
    const {clave, id_doc, respuesta, id_pre, fecha} = req.body;
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
            if(clavedoc == clave && tokend.id == id_doc && tokend.id_rol == 2 && tokend.clave == clavedoc){
                var mysqlConnection = conectar();
                const query = 'select id_cat from MRespuesta where id_pre = ?';
                mysqlConnection.query(query, id_pre, (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            var cat = rows[0].id_cat;
                            const query2 = 'insert into MRespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (? , ? , ?, ?, ?)';
                            mysqlConnection.query(query2, [id_pre, respuesta, fecha, cat, id_doc], (_err,_rows)=>{
                                if(!_err){
                                    var str = fecha.split("/");
                                    var meses = str[1] +'/'+ str[2];
                                    const query3 = 'select cant_punt, id_punt from Puntos where id_usudoc = ? AND mes_punt = ?';
                                    mysqlConnection.query(query3, [id_doc, meses], (err_, rows_)=>{
                                    if(!err_){
                                        if(rows_.length >0){
                                            var Puntostotales = rows_[0].cant_punt + 1;
                                            const query4 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                            mysqlConnection.query(query4, [Puntostotales, rows_[0].id_punt], (_err_, _rows_)=>{
                                                if(!_err_){
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Pregunta Guardada'});
                                                }else{
                                                    mysqlConnection.destroy();
                                                    console.error(_err_);
                                                    res.json({'status': '¡ERROR!'});
                                                }
                                            });
                                        }else{
                                            const query5 = 'insert into Puntos (id_usudoc, mes_punt, cant_punt) VALUES (?, ?, ?)';
                                            mysqlConnection.query(query5, [id_doc, meses, 1], (_err_, _rows_)=>{
                                                if(!_err_){
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Pregunta Guardada'});
                                                }else{
                                                    mysqlConnection.destroy();
                                                    console.error(_err_);
                                                    res.json({'status': '¡ERROR!'});
                                                }
                                            });
                                        }
                                    }else{
                                        mysqlConnection.destroy();
                                        console.error(err_);
                                        res.json({'status': '¡ERROR!'});
                                    }
                                });
                                }else{
                                    mysqlConnection.destroy();
                                    console.error(_err);
                                    res.json({'status': '¡ERROR!'});
                                }
                            });
                        }else{
                            mysqlConnection.destroy();
                            res.json({'status': '¡ERROR!'});
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
        }
    }
});


//requiere token
router.post('/Calificar/Respuesta/Usuario', (req, res)=>{
    const {usu, calif, resp} = req.body;
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
            if(tokend.id == usu && tokend.id_rol == 1 && tokend.clave== claveusu){
                var mysqlConnection = conectar();
                const query = 'select * from DCaliRes where id_usuC = ? and id_res = ?';
                mysqlConnection.query(query,[usu, resp], (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            var id = rows[0].id_CaliRes;
                            const query2 = 'update DCaliRes set cal = ? where id_CaliRes = ?';
                            mysqlConnection.query(query2,[calif, id], (_err, _rows)=>{
                                if(!_err){
                                    const query3 = 'select cal from DCaliRes where id_res = ?';
                                    mysqlConnection.query(query3, resp, (err_, rows_)=>{
                                        if(!err_){
                                            if(rows_.length > 20){
                                                var total = 0;
                                                for(var i=0 ; i<rows_.length; i++){
                                                    total += rows_[i].cal;
                                                }
                                                var promedio = total / rows_.length;
                                                if(promedio < 3){
                                                    const query4 = 'delete from DCaliRes where id_res = ?';
                                                    mysqlConnection.query(query4, resp, (_err_, _rows_)=>{
                                                        if(!_err_){
                                                            const query5 = 'select id_pre, id_usures, fecha_res from MRespuesta where id_res = ?';
                                                            mysqlConnection.query(query5, resp, (_errr_, _rowss_)=>{
                                                                if(!_errr_){
                                                                    var pre = _rowss_[0].id_pre;
                                                                    var doc = _rowss_[0].id_usures;
                                                                    var fecha = _rowss_[0].fecha_res;
                                                                    var str = fecha.split("/");
                                                                    var mes = str[1] + "/" + str[2];
                                                                    const query6 = 'select id_pre from MRespuesta where id_pre = ?';
                                                                    mysqlConnection.query(query6, pre, (__err, __rows)=>{
                                                                        if(!__err){
                                                                            var preguntas = __rows.length - 1;
                                                                            if(preguntas == 0){
                                                                                const query7 = 'update MPregunta set id_estado = ? where id_pre = ?';
                                                                                mysqlConnection.query(query7, [1, pre], (__err_, __rows_) =>{
                                                                                    if(!__err_){
                                                                                        const query8 = 'delete from MRespuesta where id_res = ?';
                                                                                        mysqlConnection.query(query8, resp, (__err__, __rows__)=>{
                                                                                            if(!__err__){
                                                                                                const query9 = 'select id_punt, cant_punt from Puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var Puntos = row[0].cant_punt;
                                                                                                        var Puntos =- 2;
                                                                                                        if(Puntos < 0){
                                                                                                            Puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [Puntos, idpunt], (error, colum)=>{
                                                                                                            if(!error){
                                                                                                                mysqlConnection.destroy();
                                                                                                                res.json({'status': 'Eliminada'});
                                                                                                            }else{
                                                                                                                mysqlConnection.destroy();
                                                                                                                console.error(error);
                                                                                                                res.json({'status': '¡ERROR!'});
                                                                                                            }
                                                                                                        });
                                                                                                    }else{
                                                                                                        mysqlConnection.destroy();
                                                                                                        console.error(er);
                                                                                                        res.json({'status': '¡ERROR!'});
                                                                                                    }
                                                                                                });
                                                                                            }else{
                                                                                                mysqlConnection.destroy();
                                                                                                console.error(__err__);
                                                                                                res.json({'status': '¡ERROR!'});
                                                                                            }
                                                                                        });
                                                                                    }else{
                                                                                        mysqlConnection.destroy();
                                                                                        console.error(__err_);
                                                                                        res.json({'status': '¡ERROR!'});
                                                                                    }
                                                                                });
                                                                            }else if(preguntas > 0){
                                                                                const query7 = 'delete from MRespuesta where id_res = ?';
                                                                                mysqlConnection.query(query7, resp, (__err_, __rows_)=>{
                                                                                    if(!__err_){
                                                                                        const query9 = 'select id_punt, cant_punt from Puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var Puntos = row[0].cant_punt;
                                                                                                        var Puntos =- 2;
                                                                                                        if(Puntos < 0){
                                                                                                            Puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [Puntos, idpunt], (error, colum)=>{
                                                                                                            if(!error){
                                                                                                                mysqlConnection.destroy();
                                                                                                                res.json({'status': 'Eliminada'});
                                                                                                            }else{
                                                                                                                mysqlConnection.destroy();
                                                                                                                console.error(error);
                                                                                                                res.json({'status': '¡ERROR!'});
                                                                                                            }
                                                                                                        });
                                                                                                    }else{
                                                                                                        mysqlConnection.destroy();
                                                                                                        console.error(er);
                                                                                                        res.json({'status': '¡ERROR!'});
                                                                                                    }
                                                                                                });
                                                                                    }else{
                                                                                        mysqlConnection.destroy();
                                                                                        console.error(__err_);
                                                                                        res.json({'status': '¡ERROR!'});
                                                                                    }
                                                                                });
                                                                            }
                                                                        }else{
                                                                            mysqlConnection.destroy();
                                                                            console.error(__err);
                                                                            res.json({'status': '¡ERROR!'});
                                                                        }
                                                                    });
                                                                }else{
                                                                    mysqlConnection.destroy();
                                                                    console.error(_errr_);
                                                                    res.json({'status': '¡ERROR!'});
                                                                }
                                                            });
                                                        }else{
                                                            mysqlConnection.destroy();
                                                            console.error(_err_);
                                                            res.json({'status': '¡ERROR!'});
                                                        }
                                                    });
                                                }else{
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Calificada'});
                                                }
                                            }else{
                                                mysqlConnection.destroy();
                                                res.json({'status': 'Calificada'});
                                            }
                                        }else{
                                            mysqlConnection.destroy();
                                            console.error(err_);
                                            res.json({'status': '¡ERROR!'});
                                        }
                                    });
                                }else{
                                    mysqlConnection.destroy();
                                    console.error(_err);
                                    res.json({'status': '¡ERROR!'});
                                }
                            });
                        }else{
                            const query2 = 'insert into DCaliRes (id_usuC, id_res, cal) VALUES (?, ?, ?)';
                            mysqlConnection.query(query2, [usu, resp, calif], (_err, _rows)=>{
                                if(!_err){
                                    const query3 = 'select cal from DCaliRes where id_res = ?';
                                    mysqlConnection.query(query3, resp, (err_, rows_)=>{
                                        if(!err_){
                                            if(rows_.length > 20){
                                                var total = 0;
                                                for(var i=0 ; i<rows_.length; i++){
                                                    total += rows_[i].cal;
                                                }
                                                var promedio = total / rows_.length;
                                                if(promedio < 3){
                                                    const query4 = 'delete from DCaliRes where id_res = ?';
                                                    mysqlConnection.query(query4, resp, (_err_, _rows_)=>{
                                                        if(!_err_){
                                                            const query5 = 'select id_pre, id_usures, fecha_res from MRespuesta where id_res = ?';
                                                            mysqlConnection.query(query5, resp, (_errr_, _rowss_)=>{
                                                                if(!_errr_){
                                                                    var pre = _rowss_[0].id_pre;
                                                                    var doc = _rowss_[0].id_usures;
                                                                    var fecha = _rowss_[0].fecha_res;
                                                                    var str = fecha.split("/");
                                                                    var mes = str[1] + "/" + str[2];
                                                                    const query6 = 'select id_pre from MRespuesta where id_pre = ?';
                                                                    mysqlConnection.query(query6, pre, (__err, __rows)=>{
                                                                        if(!__err){
                                                                            var preguntas = __rows.length - 1;
                                                                            if(preguntas == 0){
                                                                                const query7 = 'update MPregunta set id_estado = ? where id_pre = ?';
                                                                                mysqlConnection.query(query7, [1, pre], (__err_, __rows_) =>{
                                                                                    if(!__err_){
                                                                                        const query8 = 'delete from MRespuesta where id_res = ?';
                                                                                        mysqlConnection.query(query8, resp, (__err__, __rows__)=>{
                                                                                            if(!__err__){
                                                                                                const query9 = 'select id_punt, cant_punt from Puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var Puntos = row[0].cant_punt;
                                                                                                        var Puntos =- 2;
                                                                                                        if(Puntos < 0){
                                                                                                            Puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [Puntos, idpunt], (error, colum)=>{
                                                                                                            if(!error){
                                                                                                                mysqlConnection.destroy();
                                                                                                                res.json({'status': 'Eliminada'});
                                                                                                            }else{
                                                                                                                mysqlConnection.destroy();
                                                                                                                console.error(error);
                                                                                                                res.json({'status': '¡ERROR!'});
                                                                                                            }
                                                                                                        });
                                                                                                    }else{
                                                                                                        mysqlConnection.destroy();
                                                                                                        console.error(er);
                                                                                                        res.json({'status': '¡ERROR!'});
                                                                                                    }
                                                                                                });
                                                                                            }else{
                                                                                                mysqlConnection.destroy();
                                                                                                console.error(__err__);
                                                                                                res.json({'status': '¡ERROR!'});
                                                                                            }
                                                                                        });
                                                                                    }else{
                                                                                        mysqlConnection.destroy();
                                                                                        console.error(__err_);
                                                                                        res.json({'status': '¡ERROR!'});
                                                                                    }
                                                                                });
                                                                            }else if(preguntas > 0){
                                                                                const query7 = 'delete from MRespuesta where id_res = ?';
                                                                                mysqlConnection.query(query7, resp, (__err_, __rows_)=>{
                                                                                    if(!__err_){
                                                                                        const query9 = 'select id_punt, cant_punt from Puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var Puntos = row[0].cant_punt;
                                                                                                        var Puntos =- 2;
                                                                                                        if(Puntos < 0){
                                                                                                            Puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update Puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [Puntos, idpunt], (error, colum)=>{
                                                                                                            if(!error){
                                                                                                                mysqlConnection.destroy();
                                                                                                                res.json({'status': 'Eliminada'});
                                                                                                            }else{
                                                                                                                mysqlConnection.destroy();
                                                                                                                console.error(error);
                                                                                                                res.json({'status': '¡ERROR!'});
                                                                                                            }
                                                                                                        });
                                                                                                    }else{
                                                                                                        mysqlConnection.destroy();
                                                                                                        console.error(er);
                                                                                                        res.json({'status': '¡ERROR!'});
                                                                                                    }
                                                                                                });
                                                                                    }else{
                                                                                        mysqlConnection.destroy();
                                                                                        console.error(__err_);
                                                                                        res.json({'status': '¡ERROR!'});
                                                                                    }
                                                                                });
                                                                            }
                                                                        }else{
                                                                            mysqlConnection.destroy();
                                                                            console.error(__err);
                                                                            res.json({'status': '¡ERROR!'});
                                                                        }
                                                                    });
                                                                }else{
                                                                    mysqlConnection.destroy();
                                                                    console.error(_errr_);
                                                                    res.json({'status': '¡ERROR!'});
                                                                }
                                                            });
                                                        }else{
                                                            mysqlConnection.destroy();
                                                            console.error(_err_);
                                                            res.json({'status': '¡ERROR!'});
                                                        }
                                                    });
                                                }else{
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Calificada'});
                                                }
                                            }else{
                                                mysqlConnection.destroy();
                                                res.json({'status': 'Calificada'});
                                            }
                                        }else{
                                            mysqlConnection.destroy();
                                            console.error(err_);
                                            res.json({'status': '¡ERROR!'});
                                        }
                                    });
                                }else{
                                    mysqlConnection.destroy();
                                    console.error(_err);
                                    res.json({'status': '¡ERROR!'});
                                }
                            });
                        }
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '¡ERROR!'});
                    }
                });
            }else{
                res.json({'status': '¡ERROR!'});
            }
        }
    }
});

router.post('/Consultar/Respuestas', (req, res)=>{
    const{clave, id_pre} = req.body;
    if(clave == clavedoc || clave == claveusu){
        var mysqlConnection = conectar();
        const query = 'select MRespuesta.id_res, MRespuesta.des_res, MRespuesta.id_cat, MRespuesta.fecha_res, MUsuario.nom_usu, MUsuario.id_usu from MRespuesta INNER JOIN EUsuario ON MRespuesta.id_usures = EUsuario.id_EnUsuario INNER JOIN MUsuario ON EUsuario.id_usu = MUsuario.id_usu where MRespuesta.id_pre = ? AND MRespuesta.id_cat <6 ';
        mysqlConnection.query(query, id_pre, (err, rows)=>{
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
router.post('/Calificada/Respuesta', (req, res)=>{
    const{clave, usu, resp} = req.body;
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
            if(clave == claveusu && tokend.id == usu && tokend.id_rol ==1){
                var mysqlConnection = conectar();
                const query = "select cal from DCaliRes where id_res = ? and id_usuC = ?";
                mysqlConnection.query(query, [resp, usu], (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            mysqlConnection.destroy();
                            res.json({
                                'status': 'Encontrada',
                                'cal': rows[0].cal
                            });
                        }else{
                            mysqlConnection.destroy();
                            res.json({
                                'status': 'Encontrada',
                                'cal': 0
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
        }
    }
});

module.exports = router;