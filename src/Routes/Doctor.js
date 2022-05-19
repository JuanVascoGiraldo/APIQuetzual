const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const config = 'S~J?xm,:c7WU8HFz)K$a$N&[V:ez*EN#';
function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: process.env.BD_HOST || 'localhost',
        user: process.env.BD_USER ||'root',
        password: process.env.BD_PASS ||'03042021',
        database: process.env.BD_NAME ||'bdquetzual',
        port: 3306
        });
    mysqlConnection.connect(function (err) {
        if (err) {
          console.error(err);
          return;
        } 
      });
      console.log("miau")
    return mysqlConnection;
}

router.post("/Iniciar/Sesion/Validar", (req, res) =>{
    const {email_usu, contra_usu} = req.body;
    var  mysqlConnection = conectar();
    const query = 'select * from musuario where email_usu = ? and contra_usu = ? and habilitada = 1 and id_rol = 2';
    mysqlConnection.query(query, [email_usu, contra_usu], (_error, _rowws, _fields) =>{
        if(!_error){
            if(_rowws.length > 0){
                mysqlConnection.destroy();
                const token = jwt.sign({
                    id: _rowws[0].id_usu,
                    id_rol: _rowws[0].id_rol
                }, config, {
                    expiresIn: 60 * 60 * 24
                });

                res.json( {
                    status: "encontrado",
                    id_usu: _rowws[0].id_usu,
                    nom_usu: _rowws[0].nom_usu,
                    fecha_nac: _rowws[0].fecha_nac,
                    email_usu: _rowws[0].email_usu,
                    id_gen: _rowws[0].id_gen,
                    token: token
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

router.get('/Pendientes', (req, res)=>{
    const token = req.headers["token"];
    if(!token){
        res.sendStatus(404);
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.sendStatus(404);
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.id_rol == 2){
                var mysqlConnection = conectar();
                const query = 'select * from mpregunta where id_estado = 1';
                mysqlConnection.query(query, (err, rows)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json(rows);
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.sendStatus(404);
                        }
                });
            }else{
                res.sendStatus(404);
            }
        }
    }
    
});

router.post('/Pregunta/Rechazar', (req, res)=>{
    const{id_pre, id_usures, fecha_res, des_res} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.sendStatus(404);
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.sendStatus(404);
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.id_rol == 2 && tokend.id == id_usures){
                var mysqlConnection = conectar();
                const query = 'update mpregunta set id_estado = ? where id_pre = ?  and id_estado = 1';
                mysqlConnection.query(query, [ 3, id_pre], (err, rows)=>{
                    if(!err){
                        const query2 = 'insert into mrespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
                        mysqlConnection.query(query2, [id_pre, des_res, fecha_res, 6, id_usures], (_err, _rows)=>{
                            if(!_err){
                                mysqlConnection.destroy();
                                res.sendStatus(200);
                            }else{
                                mysqlConnection.destroy();
                                console.error(_err);
                                res.sendStatus(404);
                            }
                        });
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.sendStatus(404);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        }
    }

    
});

router.get('/Historico/Doctor/Respondidas', (req, res)=>{
    
    const token = req.headers["token"];
    if(!token){
        res.sendStatus(404);
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.sendStatus(404);
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.id_rol == 2){
                var mysqlConnection = conectar();
                const query = 'select mpregunta.id_pre, mpregunta.id_estado, mpregunta.des_pre, mpregunta.fecha_pre, mrespuesta.id_res, mrespuesta.des_res, mrespuesta.id_cat, mrespuesta.fecha_res, musuario.fecha_nac from mrespuesta INNER JOIN mpregunta ON mrespuesta.id_pre = mpregunta.id_pre INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mrespuesta.id_usures = ?  and mpregunta.id_estado = 2';
                mysqlConnection.query(query, tokend.id, (err, rows)=>{
                if(!err){
                    mysqlConnection.destroy();
                    res.json(rows);
                }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.sendStatus(404);
                        }
                    });
            }else{
                res.sendStatus(404);
            }
        }
    }

    
});

router.get('/Historico/Doctor/Rechazadas', (req, res)=>{
        const token = req.headers["token"];
        if(!token){
            res.sendStatus(404);
        }else{
            var seguirrr = false
            try{
                const tokend = jwt.verify(token, config);
                seguirrr = true
            }catch(error){
                res.sendStatus(404);
            }
            if(seguirrr){
                const tokend = jwt.verify(token, config);
                if(tokend.id_rol == 2){
                    var mysqlConnection = conectar();
                    const query = 'select mpregunta.id_pre, mpregunta.id_estado, mpregunta.des_pre, mpregunta.fecha_pre, mrespuesta.id_res, mrespuesta.des_res, mrespuesta.id_cat, mrespuesta.fecha_res, musuario.fecha_nac from mrespuesta INNER JOIN mpregunta ON mrespuesta.id_pre = mpregunta.id_pre INNER JOIN eusuario ON mpregunta.id_usup = eusuario.id_enusuario INNER JOIN musuario ON eusuario.id_usu = musuario.id_usu where mrespuesta.id_usures = ?  and mpregunta.id_estado = 3';
                    mysqlConnection.query(query, tokend.id, (err, rows)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json(rows);
                        }else{
                            mysqlConnection.destroy();
                            console.error(err);
                            res.sendStatus(404);
                            }
                        });
                }else{
                    res.sendStatus(404);
                }
            }
        }
        
    });

    router.post('/Pregunta/Responder', (req, res)=>{
        const{id_pre, id_usures, fecha_res, des_res, id_cat} = req.body;

        const token = req.headers["token"];
        if(!token){
            res.sendStatus(404);
        }else{
            var seguirrr = false
            try{
                const tokend = jwt.verify(token, config);
                seguirrr = true
            }catch(error){
                res.sendStatus(404);
            }
            if(seguirrr){
                const tokend = jwt.verify(token, config);
                if(tokend.id_rol == 2 && tokend.id ==id_usures ){
                    var mysqlConnection = conectar();
                    const query = 'update mpregunta set id_estado = ? where id_pre = ?  and id_estado = 1';
                    mysqlConnection.query(query, [2, id_pre], (err, rows)=>{
                        if(!err){
                            const query2 = 'insert into mrespuesta (id_pre, des_res, fecha_res, id_cat, id_usures) VALUES (?, ?, ?, ?, ?)';
                            mysqlConnection.query(query2, [id_pre, des_res, fecha_res,  id_cat, id_usures], (_err, _rows)=>{
                                if(!_err){
                                    var str = fecha_res.split("/");
                                    var meses = str[1] +'/'+ str[2];
                                    const query3 = 'select cant_punt, id_punt from Puntos where id_usudoc = ? AND mes_punt = ?';
                                    mysqlConnection.query(query3, [id_usures, meses], (err_, rows_)=>{
                                    if(!err_){
                                        if(rows_.length >0){
                                            var puntostotales = rows_[0].cant_punt + 2;
                                            const query4 = 'update puntos set cant_punt = ? where id_punt = ?';
                                            mysqlConnection.query(query4, [puntostotales, rows_[0].id_punt], (_err_, _rows_)=>{
                                                if(!_err_){
                                                    mysqlConnection.destroy();
                                                    res.sendStatus(200);
                                                }else{
                                                    mysqlConnection.destroy();
                                                    console.error(_err_);
                                                    res.sendStatus(404);
                                                }
                                            });
                                        }else{
                                            const query5 = 'insert into puntos (id_usudoc, mes_punt, cant_punt) VALUES (?, ?, ?)';
                                            mysqlConnection.query(query5, [id_usures, meses, 2], (_err_, _rows_)=>{
                                            if(!_err_){
                                                mysqlConnection.destroy();
                                                res.json({'status': 'Pregunta Guardada'});
                                            }else{
                                                mysqlConnection.destroy();
                                                console.error(_err_);
                                                res.sendStatus(404);
                                            }
                                            });
                                        }
                                    }else{
                                        mysqlConnection.destroy();
                                        console.error(err_);
                                        res.sendStatus(404);
                                    }
                                    });
                                }else{
                                    mysqlConnection.destroy();
                                    console.error(_err);
                                    res.sendStatus(404);
                                }
                            });
                        }else{
                            mysqlConnection.destroy();
                            console.error(err);
                            res.sendStatus(404);
                        }
                            });
                }else{
                    res.sendStatus(404);
                }
            }
        }   
    });

router.post('/Ranking/Mensual', (req, res)=>{
    const{mes_punt} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.sendStatus(404);
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.sendStatus(404);
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.id_rol == 2){
                var mysqlConnection = conectar();
                const query = 'select musuario.nom_usu, puntos.cant_punt from EUsuario INNER JOIN MUsuario ON Eusuario.id_usu = musuario.id_usu INNER JOIN Puntos ON puntos.id_usudoc = eusuario.id_EnUsuario where Puntos.mes_punt = ? order by puntos.cant_punt desc';
                mysqlConnection.query(query, [mes_punt], (err, rows)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json(rows);
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.sendStatus(404);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        }
    }
});
//miau


router.post('/Ranking/Historico', (req, res)=>{
    const token = req.headers["token"];
    if(!token){
        res.sendStatus(404);
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.sendStatus(404);
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.id_rol == 2){
                var mysqlConnection = conectar();
                const query = 'select id_usu, nom_usu from musuario where id_rol = 2';
                const query2 = 'select cant_punt, id_usudoc from Puntos ';
                mysqlConnection.query(query, (err, rows)=>{
                    if(!err){
                        mysqlConnection.query(query2, (errr, rowss)=>{
                            if(!errr){
                                var ranking = [];
                                for(var i = 0; i<rows.length;i++){
                                    var punt = 0;
                                    for(var j = 0; j<rowss.length;j++){
                                        if(rows[i].id_usu === rowss[j].id_usudoc){
                                            punt += rowss[j].cant_punt;
                                        }
                                    }
                                    var doctor = {
                                        nom_usu: rows[i].nom_usu,
                                        cant_punt: punt
                                    }
                                    ranking.push(doctor)
                                }
                                mysqlConnection.destroy();
                                res.json(ranking);
                            }else{
                                mysqlConnection.destroy();
                                console.error(err);
                                res.sendStatus(404);
                            }
                        });
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.sendStatus(404);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        }
    }
});


    module.exports = router;