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
        multipleStatements: true,
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
                const query = 'update mpregunta set id_estado = ? where id_pre = ?  and id_estado = 1';
                mysqlConnection.query(query, [ 3, id_pre], (err, rows)=>{
                    if(!err){
                        const query2 = 'insert into mrespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
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
    const query = 'select id_cat from mrespuesta where id_pre = ?';
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
    const query = 'select cal from dcalires where id_res = ? ';
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
                const query = 'select mpregunta.id_pre, mpregunta.id_estado, mpregunta.des_pre, mpregunta.fecha_pre, mrespuesta.id_res, mrespuesta.des_res, mrespuesta.id_cat, mrespuesta.fecha_res, musuario.fecha_nac from mrespuesta INNER JOIN mpregunta ON mrespuesta.id_pre = mpregunta.id_pre INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mrespuesta.id_usures = ?';
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
    const{id_pre, id_doc, fecha, respuesta, pregunta, clave, categoria , puntos} = req.body;
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
                const query = 'update mpregunta set des_pre = ? , id_estado = ? where id_pre = ?  and id_estado = 1';
                mysqlConnection.query(query, [pregunta, 2, id_pre], (err, rows)=>{
                    if(!err){
                        const query2 = 'insert into mrespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
                        mysqlConnection.query(query2, [id_pre, respuesta, fecha, categoria, id_doc], (_err, _rows)=>{
                            if(!_err){
                                var str = fecha.split("/");
                                var meses = str[1] +'/'+ str[2];
                                const query3 = 'select cant_punt, id_punt from Puntos where id_usudoc = ? AND mes_punt = ?';
                                mysqlConnection.query(query3, [id_doc, meses], (err_, rows_)=>{
                                    if(!err_){
                                        if(rows_.length >0){
                                            var puntostotales = rows_[0].cant_punt + puntos;
                                            const query4 = 'update puntos set cant_punt = ? where id_punt = ?';
                                            mysqlConnection.query(query4, [puntostotales, rows_[0].id_punt], (_err_, _rows_)=>{
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
                                            const query5 = 'insert into puntos (id_usudoc, mes_punt, cant_punt) VALUES (?, ?, ?)';
                                            mysqlConnection.query(query5, [id_doc, meses, puntos], (_err_, _rows_)=>{
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
                const query = 'select id_cat from mrespuesta where id_pre = ?';
                mysqlConnection.query(query, id_pre, (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            var cat = rows[0].id_cat;
                            const query2 = 'insert into mrespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (? , ? , ?, ?, ?)';
                            mysqlConnection.query(query2, [id_pre, respuesta, fecha, cat, id_doc], (_err,_rows)=>{
                                if(!_err){
                                    var str = fecha.split("/");
                                    var meses = str[1] +'/'+ str[2];
                                    const query3 = 'select cant_punt, id_punt from Puntos where id_usudoc = ? AND mes_punt = ?';
                                    mysqlConnection.query(query3, [id_doc, meses], (err_, rows_)=>{
                                    if(!err_){
                                        if(rows_.length >0){
                                            var puntostotales = rows_[0].cant_punt + 1;
                                            const query4 = 'update puntos set cant_punt = ? where id_punt = ?';
                                            mysqlConnection.query(query4, [puntostotales, rows_[0].id_punt], (_err_, _rows_)=>{
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
                                            const query5 = 'insert into puntos (id_usudoc, mes_punt, cant_punt) VALUES (?, ?, ?)';
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
                const query = 'select * from dcalires where id_usuc = ? and id_res = ?';
                mysqlConnection.query(query,[usu, resp], (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            var id = rows[0].id_CaliRes;
                            const query2 = 'update dcalires set cal = ? where id_calires = ?';
                            mysqlConnection.query(query2,[calif, id], (_err, _rows)=>{
                                if(!_err){
                                    const query3 = 'select cal from dcalires where id_res = ?';
                                    mysqlConnection.query(query3, resp, (err_, rows_)=>{
                                        if(!err_){
                                            if(rows_.length > 20){
                                                var total = 0;
                                                for(var i=0 ; i<rows_.length; i++){
                                                    total += rows_[i].cal;
                                                }
                                                var promedio = total / rows_.length;
                                                if(promedio < 3){
                                                    const query4 = 'delete from dcalires where id_res = ?';
                                                    mysqlConnection.query(query4, resp, (_err_, _rows_)=>{
                                                        if(!_err_){
                                                            const query5 = 'select id_pre, id_usures, fecha_res from mrespuesta where id_res = ?';
                                                            mysqlConnection.query(query5, resp, (_errr_, _rowss_)=>{
                                                                if(!_errr_){
                                                                    var pre = _rowss_[0].id_pre;
                                                                    var doc = _rowss_[0].id_usures;
                                                                    var fecha = _rowss_[0].fecha_res;
                                                                    var str = fecha.split("/");
                                                                    var mes = str[1] + "/" + str[2];
                                                                    const query6 = 'select id_pre from mrespuesta where id_pre = ?';
                                                                    mysqlConnection.query(query6, pre, (__err, __rows)=>{
                                                                        if(!__err){
                                                                            var preguntas = __rows.length - 1;
                                                                            if(preguntas == 0){
                                                                                const query7 = 'update mpregunta set id_estado = ? where id_pre = ?';
                                                                                mysqlConnection.query(query7, [1, pre], (__err_, __rows_) =>{
                                                                                    if(!__err_){
                                                                                        const query8 = 'delete from mrespuesta where id_res = ?';
                                                                                        mysqlConnection.query(query8, resp, (__err__, __rows__)=>{
                                                                                            if(!__err__){
                                                                                                const query9 = 'select id_punt, cant_punt from puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var puntos = row[0].cant_punt;
                                                                                                        var puntos =- 2;
                                                                                                        if(puntos < 0){
                                                                                                            puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [puntos, idpunt], (error, colum)=>{
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
                                                                                const query7 = 'delete from mrespuesta where id_res = ?';
                                                                                mysqlConnection.query(query7, resp, (__err_, __rows_)=>{
                                                                                    if(!__err_){
                                                                                        const query9 = 'select id_punt, cant_punt from puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var puntos = row[0].cant_punt;
                                                                                                        var puntos =- 2;
                                                                                                        if(puntos < 0){
                                                                                                            puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [puntos, idpunt], (error, colum)=>{
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
                            const query2 = 'insert into dcalires (id_usuc, id_res, cal) VALUES (?, ?, ?)';
                            mysqlConnection.query(query2, [usu, resp, calif], (_err, _rows)=>{
                                if(!_err){
                                    const query3 = 'select cal from dcalires where id_res = ?';
                                    mysqlConnection.query(query3, resp, (err_, rows_)=>{
                                        if(!err_){
                                            if(rows_.length > 20){
                                                var total = 0;
                                                for(var i=0 ; i<rows_.length; i++){
                                                    total += rows_[i].cal;
                                                }
                                                var promedio = total / rows_.length;
                                                if(promedio < 3){
                                                    const query4 = 'delete from dcalires where id_res = ?';
                                                    mysqlConnection.query(query4, resp, (_err_, _rows_)=>{
                                                        if(!_err_){
                                                            const query5 = 'select id_pre, id_usures, fecha_res from mrespuesta where id_res = ?';
                                                            mysqlConnection.query(query5, resp, (_errr_, _rowss_)=>{
                                                                if(!_errr_){
                                                                    var pre = _rowss_[0].id_pre;
                                                                    var doc = _rowss_[0].id_usures;
                                                                    var fecha = _rowss_[0].fecha_res;
                                                                    var str = fecha.split("/");
                                                                    var mes = str[1] + "/" + str[2];
                                                                    const query6 = 'select id_pre from mrespuesta where id_pre = ?';
                                                                    mysqlConnection.query(query6, pre, (__err, __rows)=>{
                                                                        if(!__err){
                                                                            var preguntas = __rows.length - 1;
                                                                            if(preguntas == 0){
                                                                                const query7 = 'update mpregunta set id_estado = ? where id_pre = ?';
                                                                                mysqlConnection.query(query7, [1, pre], (__err_, __rows_) =>{
                                                                                    if(!__err_){
                                                                                        const query8 = 'delete from mrespuesta where id_res = ?';
                                                                                        mysqlConnection.query(query8, resp, (__err__, __rows__)=>{
                                                                                            if(!__err__){
                                                                                                const query9 = 'select id_punt, cant_punt from puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var puntos = row[0].cant_punt;
                                                                                                        var puntos =- 2;
                                                                                                        if(puntos < 0){
                                                                                                            puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [puntos, idpunt], (error, colum)=>{
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
                                                                                const query7 = 'delete from mrespuesta where id_res = ?';
                                                                                mysqlConnection.query(query7, resp, (__err_, __rows_)=>{
                                                                                    if(!__err_){
                                                                                        const query9 = 'select id_punt, cant_punt from puntos where id_usudoc = ? and mes_punt = ?';
                                                                                                mysqlConnection.query(query9, [doc, mes],(er, row)=>{
                                                                                                    if(!er){
                                                                                                        var puntos = row[0].cant_punt;
                                                                                                        var puntos =- 2;
                                                                                                        if(puntos < 0){
                                                                                                            puntos = 0;
                                                                                                        }
                                                                                                        var idpunt = row[0].id_punt;
                                                                                                        const query10 = 'update puntos set cant_punt = ? where id_punt = ?';
                                                                                                        mysqlConnection.query(query10, [puntos, idpunt], (error, colum)=>{
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
        const query = 'select mrespuesta.id_res, mrespuesta.des_res, mrespuesta.id_cat, mrespuesta.fecha_res, musuario.nom_usu, musuario.id_usu from mrespuesta INNER JOIN eusuario ON mrespuesta.id_usures = eusuario.id_EnUsuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mrespuesta.id_pre = ? AND mrespuesta.id_cat <6 ';
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
                const query = "select cal from dcalires where id_res = ? and id_usuc = ?";
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