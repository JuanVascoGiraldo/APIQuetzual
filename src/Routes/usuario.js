const {Router} = require('express');
const router = Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
var claveusu = 'As7cnuLSSGkw85A8SdrDJmqLHsSJAfqd';
var clavedoc = 'S:sVw>SN?j75zcA#-q{YdZ_5#W{E=X2q';
var claveadmin = "72eV)'xL9}:NQ999X(MUFa$MTw]$zz;w";
const config = 'S~J?xm,:c7WU8HFz)K$a$N&[V:ez*EN#';
var dire = 'https://quetzual.herokuapp.com/'
const fs = require('fs')
const path = require('path')
//var dire = 'http://localhost:8084/QuetzualWeb/'
/*
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b5281614b1195e',
    password: '1025be05',
    database: 'heroku_3f56efd65cc9251',

    host: process.env.BD_HOST || 'localhost',
    user: process.env.BD_USER ||'root',
    password: process.env.BD_PASS ||'03042021',
    database: process.env.BD_NAME ||'bdquetzual',

    var conn=mysql.createConnection({host:"quetzual.mysql.database.azure.com", user:"quetzualadmin", password:"{your_password}", database:"{your_database}", port:3306, ssl:{ca:fs.readFileSync("{ca-cert filename}")}});

*/

function conectar(){
    const mysqlConnection = mysql.createConnection({
        host: process.env.BD_HOST || '127.0.0.1',
        user: process.env.BD_USER ||'root',
        password: process.env.BD_PASS ||'JuanVasco22$',
        database: process.env.BD_NAME ||'BDQuetzual',
        port: 3306
        });
    mysqlConnection.connect(function (err) {
        if (err) {
            console.error(err);
            return;
        } 
    });
    return mysqlConnection;
}

router.get('/Prueba',(req, res) => {
    //const {correo, contra} = req.body;
    const correo = 'juanlandia3000'
    const contra = '1234566'
    console.log("miau")
    var  mysqlConnection = conectar();
    const query = 'select * from MUsuario where email_usu = ? and contra_usu = ? and habilitada = 1';
    mysqlConnection.query(query, [correo, contra], (_error, _rowws, _fields) =>{
        if(!_error){
            res.sendStatus(200);
        }else{
            console.error(_error);
            mysqlConnection.destroy();
            res.sendStatus(404);
        }
    });
})


function sendmail(correo, asunto, cuerpo){
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "quetzual@gmail.com", // generated ethereal user
          pass: "ihdzyyhtekmqnsxi", // generated ethereal password
        },
    });

    transporter.verify().then(() =>{
        console.log("listo para enviar datos")
    })

        transporter.sendMail({
        from: 'quetzual@gmail.com', // sender address
        to: correo , // list of receivers
        subject: asunto, // Subject line
        html: cuerpo, // html body
    });

}


router.post('/Registrar/Usuario/Estudiante',(req, res) => {
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguir = false
        try{
            const tokend = jwt.verify(token, config);
            seguir = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguir){
            const tokend = jwt.verify(token, config);
            if( tokend.UClave === claveusu){
                var  mysqlConnection = conectar();
                const queryy= 'select * from MUsuario where email_usu = ?';
                mysqlConnection.query(queryy, tokend.UCorreo, (_error, _rowws, _fields) =>{
                    if(!_error) {
                        if(_rowws.length === 0){
                            const query = `insert into MUsuario (nom_usu, fecha_nac, email_usu, contra_usu, id_gen, id_rol, habilitada) VALUES (?,?,?,?,?,?,?) `;
                            mysqlConnection.query(query, [tokend.UNombre,  tokend.UFecha, tokend.UCorreo, tokend.UContra, tokend.UGenero, 1, 1 ], (err, _rows, _fields) => {
                            if(!err) {
                                mysqlConnection.query('select id_usu from MUsuario where email_usu = ?', tokend.UCorreo, (errr, rowss, _fields) =>{
                                    if(!errr){
                                        if(rowss.length > 0){
                                            var id= rowss[0].id_usu;
                                            mysqlConnection.query('insert into EUsuario (id_EnUsuario, id_usu) VALUES (?, ?)', [id, id],(errrr, _rows, _fields) =>{
                                                if(!errrr){
                                                    mysqlConnection.destroy();
                                                    res.json({
                                                        'status': 'Se ha guardado el Usuario',
                                                        'Correo': tokend.UCorreo,
                                                        'Contra': tokend.UContra
                                                });
                                                }else{
                                                    console.log(errrr);
                                                    mysqlConnection.destroy();
                                                    res.json({'status': '??ERROR!'});
                                                }
                                            } );
                                        }else{
                                            mysqlConnection.destroy();
                                            res.json({'status': '??ERROR!'});
                                        }
                                    }else{
                                        console.log(errr);
                                        mysqlConnection.destroy();
                                        res.json({'status': '??ERROR!'});
                                    }
                                });
                                } else {
                                    console.log(err);
                                    mysqlConnection.destroy();
                                    res.json({'status': '??ERROR!'});
                                }
                                    });
                        }else {
                            mysqlConnection.destroy();
                            res.json({'status': '??ERROR!'});
                        }

                    } else {
                        console.error(_error);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'});
            }
        }
    }
});

router.post('/Registrar/Token',(req, res) => {
    const {Nombre, correo, contra, fecha, genero, Clave, enviar} = req.body;
    if( Clave === claveusu){
        var  mysqlConnection = conectar();
        const queryy= 'select * from MUsuario where email_usu = ?';
        mysqlConnection.query(queryy, correo, (_error, _rowws, _fields) =>{
            if(!_error) {
                if(_rowws.length === 0){
                    const token = jwt.sign({
                        UNombre: Nombre,
                        UContra: contra,
                        UCorreo: correo,
                        UFecha : fecha,
                        UGenero : genero,
                        UClave : Clave
                    }, config, {
                        expiresIn: 60 * 30
                    });
                    var link = dire +"Confirmar?token="+token
                    var cuerpo = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:georgia, times, \'times new roman\', serif">' +
                        '<head>' +
                        '<meta charset="UTF-8">' +
                        '<meta content="width=device-width, initial-scale=1" name="viewport">' +
                        '<meta name="x-apple-disable-message-reformatting">' +
                        '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                        '<meta content="telephone=no" name="format-detection">' +
                        '<title>Nueva plantilla de correo electrC3B3nico 2022-03-15</title><!--[if (mso 16)]>' +
                        '<style type="text/css">' +
                        'a {text-decoration: none;}' +
                        '</style>' +
                        '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>' +
                        '<xml>' +
                        '<o:OfficeDocumentSettings>' +
                        '<o:AllowPNG></o:AllowPNG>' +
                        '<o:PixelsPerInch>96</o:PixelsPerInch>' +
                        '</o:OfficeDocumentSettings>' +
                        '</xml>' +
                        '<![endif]-->' +
                        '<style type="text/css"> ' +
                        '#outlook a {' +
                        'padding:0;' +
                        '}' +
                        '.es-button {' +
                        'mso-style-priority:100!important;' +
                        'text-decoration:none!important;' +
                        '}' +
                        'a[x-apple-data-detectors] { ' +
                        'color:inherit!important;' +
                        'text-decoration:none!important;' +
                        'font-size:inherit!important;' +
                        'font-family:inherit!important;' +
                        'font-weight:inherit!important;' +
                        'line-height:inherit!important;' +
                        '}' +
                        '.es-desk-hidden {' +
                        'display:none;' +
                        'float:left;' +
                        'overflow:hidden;' +
                        'width:0;' +
                        'max-height:0;' +
                        'line-height:0;' +
                        'mso-hide:all;' +
                        '}' +
                        '[data-ogsb] .es-button {' +
                        'border-width:0!important;' +
                        'padding:10px 20px 10px 20px!important;' +
                        '}' +
                        '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:center } h2 { font-size:28px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:center } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:28px!important; text-align:center } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:center } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }' +
                        '</style>' +
                        '</head>' +
                        '<body style="width:100%;font-family:georgia, times, \'times new roman\', serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">' +
                        '<div class="es-wrapper-color" style="background-color:#AAFACE"><!--[if gte mso 9]>' +
                        '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">' +
                        '<v:fill type="tile" color="#aaface" origin="0.5, 0" position="0.5, 0"></v:fill>' +
                        '</v:background>' +
                        '<![endif]-->' +
                        '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#AAFACE">' +
                        '<tr>' +
                        '<td valign="top" style="padding:0;Margin:0">' +
                        '<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0">' +
                        '<table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">' +
                        '<tr>' +
                        '<td align="left" style="Margin:0;padding-top:15px;padding-bottom:20px;padding-left:20px;padding-right:20px">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0;font-size:0px"><img src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" height="150" title="Logo"></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table>' +
                        '<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0">' +
                        '<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">' +
                        '<tr>' +
                        '<td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://kmgkqf.stripocdn.email/content/guids/CABINET_825aab351a0691f7dfce04f0d118350e/images/undraw_welcoming_re_x0qo_Rf8.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="300"></td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><h1 style="Margin:0;line-height:60px;mso-line-height-rule:exactly;font-family:georgia, times, \'times new roman\', serif;font-size:50px;font-style:normal;font-weight:bold;color:#333333">Bienvenido a Quetzual</h1><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Estas a un paso de empezar en Quetzual, confirma tu correo electr??nico para empezar a navegar en la pagina</p></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table>' +
                        '<table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0">' +
                        '<table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">' +
                        '<tr>' +
                        '<td align="left" style="padding:20px;Margin:0">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td align="left" style="padding:0;Margin:0;width:560px">' +
                        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                        '<tr>' +
                        '<td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#2CB543;border-width:0px 0px 2px 0px;display:inline-block;border-radius:30px;width:auto"><a href="'+link+'" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;border-style:solid;border-color:#31CB4B;border-width:10px 20px 10px 20px;display:inline-block;background:#31CB4B;border-radius:30px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center">Empezar</a></span></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table></td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>' +
                        '</body>' +
                        '</html>';
                    sendmail(enviar, "Registro", cuerpo);
                    mysqlConnection.destroy();
                    res.json({'status':'Enviado'});
                }else {
                    mysqlConnection.destroy();
                    res.json({'status': '??ERROR!'});
                }

            } else {
                console.error(_error);
                mysqlConnection.destroy();
                res.json({'status': '??ERROR!'});
            }
        });
    }else{
        res.json({'status': '??ERROR!'});
    }
});


router.post('/Registrar/Usuario/Doctor',(req, res) => {
    const {Nombre, correo, contra, fecha, genero, Clave, id, email, pass} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr= true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }

        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if( Clave === claveadmin && Clave === tokend.clave && id === tokend.id && tokend.id_rol == 3){
                var  mysqlConnection = conectar();
                const queryy= 'select * from MUsuario where email_usu = ?';
                mysqlConnection.query(queryy, correo, (_error, _rowws, _fields) =>{
                    if(!_error) {
                        if(_rowws.length === 0){
                            const query = `insert into MUsuario (nom_usu, fecha_nac, email_usu, contra_usu, id_gen, id_rol, habilitada) VALUES (?,?,?,?,?,?,?) `;
                            mysqlConnection.query(query, [Nombre,  fecha, correo, contra, genero, 2, 1 ], (err, _rows, _fields) => {
                            if(!err) {
                                mysqlConnection.query('select id_usu from MUsuario where email_usu = ?', correo, (errr, rowss, _fields) =>{
                                    if(!errr){
                                        if(rowss.length > 0){
                                            var id= rowss[0].id_usu;
                                            mysqlConnection.query('insert into EUsuario (id_EnUsuario, id_usu) VALUES (?, ?)', [id, id],(errrr, _rows, _fields) =>{
                                                if(!errrr){
                                                    var cuerpo = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
                                                    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, \'helvetica neue\', helvetica, sans-serif">'+
                                                    '<head>'+
                                                    '<meta charset="UTF-8">'+
                                                    '<meta content="width=device-width, initial-scale=1" name="viewport">'+
                                                    '<meta name="x-apple-disable-message-reformatting">'+
                                                    '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
                                                    '<meta content="telephone=no" name="format-detection">'+
                                                    '<title>Nueva plantilla 3</title><!--[if (mso 16)]>'+
                                                    '<style type="text/css">'+
                                                    'a {text-decoration: none;}'+
                                                    '</style>'+
                                                    '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>'+
                                                    '<xml>'+
                                                    '<o:OfficeDocumentSettings>'+
                                                    '<o:AllowPNG></o:AllowPNG>'+
                                                    '<o:PixelsPerInch>96</o:PixelsPerInch>'+
                                                    '</o:OfficeDocumentSettings>'+
                                                    '</xml>'+
                                                    '<![endif]-->'+
                                                    '<style type="text/css">'+
                                                    '#outlook a {'+
                                                    'padding:0;'+
                                                    '}'+
                                                    '.es-button {'+
                                                    'mso-style-priority:100!important;'+
                                                    'text-decoration:none!important;'+
                                                    '}'+
                                                    'a[x-apple-data-detectors] {'+
                                                    'color:inherit!important;'+
                                                    'text-decoration:none!important;'+
                                                    'font-size:inherit!important;'+
                                                    'font-family:inherit!important;'+
                                                    'font-weight:inherit!important;'+
                                                    'line-height:inherit!important;'+
                                                    '}'+
                                                    '.es-desk-hidden {'+
                                                    'display:none;'+
                                                    'float:left;'+
                                                    'overflow:hidden;'+
                                                    'width:0;'+
                                                    'max-height:0;'+
                                                    'line-height:0;'+
                                                    'mso-hide:all;'+
                                                    '}'+
                                                    '[data-ogsb] .es-button {'+
                                                    'border-width:0!important;'+
                                                    'padding:10px 30px 10px 30px!important;'+
                                                    '}'+
                                                    '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }'+
                                                    '</style>'+
                                                    '</head>'+
                                                    '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">'+
                                                    '<div class="es-wrapper-color" style="background-color:#AAFACE"><!--[if gte mso 9]>'+
                                                    '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">'+
                                                    '<v:fill type="tile" color="#aaface" origin="0.5, 0" position="0.5, 0"></v:fill>'+
                                                    '</v:background>'+
                                                    '<![endif]-->'+
                                                    '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#AAFACE">'+
                                                    '<tr>'+
                                                    '<td valign="top" style="padding:0;Margin:0">'+
                                                    '<table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">'+
                                                    '<tr>'+
                                                    '<td align="center" style="padding:0;Margin:0">'+
                                                    '<table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="150"></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:20px;Margin:0">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">Bienvenido Doctor&nbsp;</h1></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://kmgkqf.stripocdn.email/content/guids/CABINET_712281b3ae5077e9eee855fb2ae9760b/images/undraw_interview_re_e5jn.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="260"></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Gracias por hacer parte de este proyecto, aqu?? est??n los datos de acceso para que pueda ingresar en su cuenta.</p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->'+
                                                    '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
                                                    '<tr>'+
                                                    '<td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px;text-align:center">Correo:<br></p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->'+
                                                    '<table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;width:270px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px; text-align:center">'+email+'</p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->'+
                                                    '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
                                                    '<tr>'+
                                                    '<td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px;text-align:center">Contrase??a</p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->'+
                                                    '<table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;width:270px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px;text-align:center">'+pass+'<br></p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#e4599e;border-width:0px;display:inline-block;border-radius:5px;width:auto"><a href="'+dire+'" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#e4599e;border-width:10px 30px 10px 30px;display:inline-block;background:#e4599e;border-radius:5px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center">Iniciar</a></span></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">'+
                                                    '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                                                    '<tr>'+
                                                    '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#333333;font-size:10px;text-align:center">Tecnologia Administrativa Creativa y Operativa de Software</p></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table></td>'+
                                                    '</tr>'+
                                                    '</table>'+
                                                    '</div>'+
                                                    '</body>'+
                                                    '</html>'                                        
                                                    sendmail(email, 'Bienvenido a Quetzual' , cuerpo )
                                                    mysqlConnection.commit();
                                                    mysqlConnection.destroy();
                                                    res.json({'status': 'Se ha guardado el Usuario'});
                                                }else{
                                                    console.log(errrr);
                                                    mysqlConnection.destroy();
                                                    res.json({'status': '??ERROR!'});
                                                }
                                            } );
                                        }else{
                                            mysqlConnection.destroy();
                                            res.json({'status': '??ERROR!'});
                                        }
                                    }else{
                                        console.log(errr);
                                        mysqlConnection.destroy();
                                        res.json({'status': '??ERROR!'});
                                    }
                                });
                                } else {
                                    console.log(err);
                                    mysqlConnection.destroy();
                                    res.json({'status': '??ERROR!'});
                                }
                                    });
                        }else {
                            
                            mysqlConnection.destroy();
                            res.json({'status': '??ERROR!'});
                        }

                    } else {
                        console.error(_error);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'});
                    }
                });
                }else{
                    res.json({'status': '??ERROR!'});
                }
        }
    }
});

router.post("/Iniciar/Sesion/Validar", (req, res) =>{
    const {correo, contra} = req.body;
    var  mysqlConnection = conectar();
    const query = 'select * from MUsuario where email_usu = ? and contra_usu = ? and habilitada = 1';
    mysqlConnection.query(query, [correo, contra], (_error, _rowws, _fields) =>{
        if(!_error){
            if(_rowws.length > 0){
                mysqlConnection.destroy();
                var claves = '';
                if(_rowws[0].id_rol == 3){
                    claves = claveadmin;
                }else if(_rowws[0].id_rol == 2){
                    claves = clavedoc;
                }else{
                    claves = claveusu;
                }

                const token = jwt.sign({
                    clave: claves,
                    id: _rowws[0].id_usu,
                    id_rol: _rowws[0].id_rol
                }, config, {
                    expiresIn: 60 * 60 * 24
                });
                res.json({
                    'status': 'Se ha iniciado Sesion',
                    'usuario': _rowws,
                    'token': token
                });
            }else{
                mysqlConnection.destroy();
                res.json({'status': '??ERROR!'});
            }
        }else{
            console.error(_error);
            mysqlConnection.destroy();
            res.json({'status': '??ERROR!'});
        }
    });

});

router.post('/Modificar/Usuario', (req, res) => {
    const {id, fecha, nombre, id_gen, clave, rol}= req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(( rol == tokend.id_rol && clave == tokend.clave && id == tokend.id ) && (( 1 == tokend.id_rol && claveusu == tokend.clave)||( 3 == tokend.id_rol && claveadmin == tokend.clave))){
                var mysqlConnection = conectar();
                const query2 = "update MUsuario set nom_usu = ? , fecha_nac = ? , id_gen = ? where id_usu = ? ";
                mysqlConnection.query(query2, [nombre, fecha, id_gen, id], (_error, _rows, _fields) =>{
                    if(!_error){
                        mysqlConnection.destroy();
                        res.json({'status': 'Cambio Guardado'})
                    }else{
                        console.error(_error);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

router.post('/Modificar/Usuario/Doctor', (req, res) => {
    const {id, correo, fecha, nombre, id_gen, clave, rol}= req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(rol == tokend.id_rol && clave == tokend.clave && claveadmin == tokend.clave && 3 == tokend.id_rol){
                var mysqlConnection = conectar();
                const query = "Select id_usu from MUsuario where email_usu = ?";
                mysqlConnection.query(query, correo, (err, rows, fields)=>{
                    if(!err){
                        if(rows.length > 0){
                            if(rows[0].id_usu == id){
                                const query2 = "update MUsuario set nom_usu = ? , fecha_nac = ? , id_gen = ? where id_usu = ? and id_rol = ? ";
                                mysqlConnection.query(query2, [nombre, fecha, id_gen, id, 2], (_error, _rows, _fields) =>{
                                    if(!_error){
                                        mysqlConnection.destroy();
                                        res.json({'status': 'Cambio Guardado'})
                                    }else{
                                        console.error(_error);
                                        mysqlConnection.destroy();
                                        res.json({'status': '??ERROR!'})
                                    }
                                });
                            }else{
                                mysqlConnection.destroy();
                                res.json({'status': '??ERROR!'})
                            }
                        }else{
                            const query2 = "update MUsuario set nom_usu = ? , fecha_nac = ? , email_usu = ? , id_gen = ? where id_usu = ? ";
                            mysqlConnection.query(query2, [nombre, fecha, correo, id_gen, id], (_error, _rows, _fields) =>{
                                if(!_error){
                                    mysqlConnection.destroy();
                                    res.json({'status': 'Cambio Guardado'})
                                }else{
                                    console.error(_error);
                                    mysqlConnection.destroy();
                                    res.json({'status': '??ERROR!'})
                                }
                            });
                        }
                    }else{
                        console.error(err);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

router.post('/Modificar/Password', (req, res) => {
    const {id, rol, clave, pass} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(( rol == tokend.id_rol  && clave == tokend.clave && id == tokend.id) && ((1 == tokend.id_rol  && claveusu == tokend.clave )||(3 == tokend.id_rol  && claveadmin == tokend.clave ))){
                var mysqlConnection = conectar();
                const query = "update MUsuario set contra_usu = ? where id_usu = ? and id_rol = ?";
                mysqlConnection.query(query, [pass, id, rol], (err, rows, fields) => {
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({'status': 'Cambio Realizado'});
                    }else{
                        console.error(err);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

router.post('/Eliminar/Estudiante', (req, res) =>{
    const{id, clave, rol} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(rol == 1 && clave == claveusu && rol== tokend.id_rol && id == tokend.id && clave == tokend.clave){
                var mysqlConnection = conectar();
                const query = "update MUsuario set habilitada = ? , nom_usu = ? , email_usu = ? where id_usu = ? and id_rol = ? ";
                mysqlConnection.query(query, [0,'Usuario Elimado', 'Usuario Eliminado', id , 1], (err, rows, fields) =>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({'status': 'Cuenta Eliminada'});
                    }else{
                        console.error(err);
                        mysqlConnection.destroy();
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

//requiere token
router.post('/Obtener/Doctores' , (req, res) => {
    const {clave} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveadmin && tokend.id_rol == 3 && tokend.clave == claveadmin){
                var mysqlConnection = conectar();
                const query = "select nom_usu, email_usu, fecha_nac, id_usu, habilitada, id_gen from MUsuario where id_rol = ?";
                mysqlConnection.query(query, [2], (err, rows, field)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontrados',
                            'datos': rows 
                        });
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

//requiere token
router.post('/Obtener/Doctores/rank' , (req, res) => {
    const {clave} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if((clave == claveadmin && tokend.id_rol == 3) || (clave == clavedoc && tokend.id_rol == 2)){
                var mysqlConnection = conectar();
                const query = "select nom_usu, id_usu from MUsuario where id_rol = ? ";
                mysqlConnection.query(query, [2], (err, rows, field)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontrados',
                            'datos': rows });
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

//requiere token
router.post('/Deshabilitar/Doctor', (req, res) =>{
    const {id, nom} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.clave == claveadmin && tokend.id_rol == 3){
                var mysqlConnection = conectar();
                const query = 'update MUsuario set habilitada = ?, email_usu = ? where id_usu = ? and id_rol = ?';
                mysqlConnection.query(query, [0, nom , id, 2], (err, rows, fields)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({'status': 'Cuenta Deshabilitada'})
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

router.post('/Progreso/General', (req, res) => {
    const {clave} = req.body;
    
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection  = conectar();
        const query = "Select DCaliRes.cal , MRespuesta.id_cat from DCaliRes INNER JOIN MRespuesta ON DCaliRes.id_res = MRespuesta.id_res";
        mysqlConnection.query(query, (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontrados',
                    'datos': rows });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '??ERROR!'})
            }
        });
    }else{
        res.json({'status': '??ERROR!'})
    }
});

//requiere token
router.post('/Progreso/Usuario/Calificaciones', (req, res) => {
    const {clave, id} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveusu && tokend.id == id && tokend.id_rol == 1){
                var mysqlConnection  = conectar();
                const query = "Select DCaliRes.cal , MRespuesta.id_cat from DCaliRes INNER JOIN MRespuesta ON DCaliRes.id_res = MRespuesta.id_res where DCaliRes.id_usuC = ?";
                mysqlConnection.query(query, [id], (err, rows)=>{
                    if(!err){
                        mysqlConnection.destroy();
                        res.json({
                            'status': 'Encontrados',
                            'datos': rows });
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'})
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});

//requiere token
router.post('/Progreso/Estudiante/Preguntas', (req, res)=>{
    const {clave, id} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveusu && tokend.id == id && tokend.id_rol == 1){
                var mysqlConnection  = conectar();
                const query = 'Select id_estado from MPregunta where (id_estado = 3 OR id_estado = 2) AND id_usup= ? ';
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
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
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
                res.json({'status': '??ERROR!'});
            }
        });
    }else{
        res.json({'status': '??ERROR!'})
    }
});

router.post('/Ranking/Mensual', (req, res)=>{
    const{clave, mes} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection = conectar();
        const query = 'select MUsuario.nom_usu, Puntos.cant_punt from EUsuario INNER JOIN MUsuario ON EUsuario.id_usu = MUsuario.id_usu INNER JOIN Puntos ON Puntos.id_usudoc = EUsuario.id_EnUsuario where Puntos.mes_punt = ? order by Puntos.cant_punt desc';
        mysqlConnection.query(query, [mes], (err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status': 'Encontradas',
                    'datos': rows
                });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '??ERROR!'});
            }
        });
    }else{
        res.json({'status': '??ERROR!'})
    }
});

//requiere token
router.post('/Consultar/Doctor', (req, res)=>{
    const{clave, id} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(clave == claveadmin && tokend.id_rol == 3 && tokend.clave == claveadmin){
                var mysqlConnection = conectar();
                const query = 'select * from MUsuario where id_usu = ? and id_rol = ?';
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
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});


router.post('/Cambiar/Email', (req, res)=>{ 
    const{email, newemail, id, clave} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            if(tokend.clave == clave && clave == claveusu && tokend.id == id){
                var mysqlConnection = conectar();
                const query = 'select * from MUsuario where email_usu = ?';
                mysqlConnection.query(query, newemail, (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            mysqlConnection.destroy();
                            res.json({'status': '??ERROR!'});
                        }else{
                            mysqlConnection.destroy();
                            const token = jwt.sign({
                                UCorreo: newemail,
                                UId: id
                            }, config, {
                                expiresIn: 60 * 30
                            });
                            var link = dire+"ConfModi?token="+token
                            var cuerpo = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                                '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:georgia, times, \'times new roman\', serif">' +
                                '<head>' +
                                '<meta charset="UTF-8">' +
                                '<meta content="width=device-width, initial-scale=1" name="viewport">' +
                                '<meta name="x-apple-disable-message-reformatting">' +
                                '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                                '<meta content="telephone=no" name="format-detection">' +
                                '<title>Nueva plantilla de correo electrC3B3nico 2022-03-15</title><!--[if (mso 16)]>' +
                                '<style type="text/css">' +
                                'a {text-decoration: none;}' +
                                '</style>' +
                                '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>' +
                                '<xml>' +
                                '<o:OfficeDocumentSettings>' +
                                '<o:AllowPNG></o:AllowPNG>' +
                                '<o:PixelsPerInch>96</o:PixelsPerInch>' +
                                '</o:OfficeDocumentSettings>' +
                                '</xml>' +
                                '<![endif]-->' +
                                '<style type="text/css"> ' +
                                '#outlook a {' +
                                'padding:0;' +
                                '}' +
                                '.es-button {' +
                                'mso-style-priority:100!important;' +
                                'text-decoration:none!important;' +
                                '}' +
                                'a[x-apple-data-detectors] { ' +
                                'color:inherit!important;' +
                                'text-decoration:none!important;' +
                                'font-size:inherit!important;' +
                                'font-family:inherit!important;' +
                                'font-weight:inherit!important;' +
                                'line-height:inherit!important;' +
                                '}' +
                                '.es-desk-hidden {' +
                                'display:none;' +
                                'float:left;' +
                                'overflow:hidden;' +
                                'width:0;' +
                                'max-height:0;' +
                                'line-height:0;' +
                                'mso-hide:all;' +
                                '}' +
                                '[data-ogsb] .es-button {' +
                                'border-width:0!important;' +
                                'padding:10px 20px 10px 20px!important;' +
                                '}' +
                                '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:center } h2 { font-size:28px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:center } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:28px!important; text-align:center } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:center } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }' +
                                '</style>' +
                                '</head>' +
                                '<body style="width:100%;font-family:georgia, times, \'times new roman\', serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">' +
                                '<div class="es-wrapper-color" style="background-color:#AAFACE"><!--[if gte mso 9]>' +
                                '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">' +
                                '<v:fill type="tile" color="#aaface" origin="0.5, 0" position="0.5, 0"></v:fill>' +
                                '</v:background>' +
                                '<![endif]-->' +
                                '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#AAFACE">' +
                                '<tr>' +
                                '<td valign="top" style="padding:0;Margin:0">' +
                                '<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0">' +
                                '<table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">' +
                                '<tr>' +
                                '<td align="left" style="Margin:0;padding-top:15px;padding-bottom:20px;padding-left:20px;padding-right:20px">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0;font-size:0px"><img src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" height="150" title="Logo"></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table>' +
                                '<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0">' +
                                '<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">' +
                                '<tr>' +
                                '<td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://kmgkqf.stripocdn.email/content/guids/CABINET_825aab351a0691f7dfce04f0d118350e/images/undraw_welcoming_re_x0qo_Rf8.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="300"></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><h1 style="Margin:0;line-height:60px;mso-line-height-rule:exactly;font-family:georgia, times, \'times new roman\', serif;font-size:50px;font-style:normal;font-weight:bold;color:#333333">Modificar Correo</h1><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Confirma el Correo pasa poder hacer el cambio en tu cuenta</p></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table>' +
                                '<table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0">' +
                                '<table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">' +
                                '<tr>' +
                                '<td align="left" style="padding:20px;Margin:0">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td align="left" style="padding:0;Margin:0;width:560px">' +
                                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">' +
                                '<tr>' +
                                '<td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#2CB543;border-width:0px 0px 2px 0px;display:inline-block;border-radius:30px;width:auto"><a href="'+link+'" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;border-style:solid;border-color:#31CB4B;border-width:10px 20px 10px 20px;display:inline-block;background:#31CB4B;border-radius:30px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center">Cambiar</a></span></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table></td>' +
                                '</tr>' +
                                '</table>' +
                                '</div>' +
                                '</body>' +
                                '</html>';
                            sendmail(email, "Cambiar Correo", cuerpo);
                            res.json({'status':'Enviado'});
                        }
                    }else{
                        
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'});
                    }
                });
            }else{
                res.json({'status': '??ERROR!'})
            }
        }
    }
});


router.post('/Confirmar/Email', (req, res)=>{
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            var mysqlConnection = conectar();
                const query = 'select * from MUsuario where email_usu = ?';
                mysqlConnection.query(query, tokend.UCorreo, (err, rows)=>{
                    if(!err){
                        if(rows.length > 0){
                            mysqlConnection.destroy();
                            res.json({'status': '??ERROR!'});
                        }else{
                            const query2 = "update MUsuario set email_usu = ? where id_usu = ? ";
                            mysqlConnection.query(query2, [tokend.UCorreo, tokend.UId], (_error, _rows, _fields) =>{
                                if(!_error){
                                    mysqlConnection.destroy();
                                    res.json({'status': 'Cambio Guardado'})
                                }else{
                                    console.error(_error);
                                    mysqlConnection.destroy();
                                    res.json({'status': '??ERROR!'})
                                }
                            });
                        }
                    }else{
                        mysqlConnection.destroy();
                        console.error(err);
                        res.json({'status': '??ERROR!'});
                    }
                });
            }
    }
});


router.post('/Recuperar/Password/Token', (req, res)=>{ 
    const{email, sendemail} = req.body;
    var mysqlConnection = conectar();
    const query = 'select * from MUsuario where email_usu = ?';
    mysqlConnection.query(query, email, (err, rows)=>{
        if(!err){
            if(rows.length == 0){
                mysqlConnection.destroy();
                res.json({'status': '??ERROR!'});
            }else{
                mysqlConnection.destroy();
                const token = jwt.sign({
                        UId: rows[0].id_usu
                    }, config, {
                        expiresIn: 60 * 10
                    });
                var link = dire +"recuperarcontra.jsp?token="+token
                var cuerpo = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
                '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:georgia, times, \'times new roman\', serif">'+
                '<head>'+
                '<meta charset="UTF-8">'+
                '<meta content="width=device-width, initial-scale=1" name="viewport">'+
                '<meta name="x-apple-disable-message-reformatting">'+
                '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
                '<meta content="telephone=no" name="format-detection">'+
                '<title>Nueva plantilla de correo electrC3B3nico 2022-03-15</title><!--[if (mso 16)]>'+
                '<style type="text/css">'+
                'a {text-decoration: none;}'+
                '</style>'+
                '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>'+
                '<xml>'+
                '<o:OfficeDocumentSettings>'+
                '<o:AllowPNG></o:AllowPNG>'+
                '<o:PixelsPerInch>96</o:PixelsPerInch>'+
                '</o:OfficeDocumentSettings>'+
                '</xml>'+
                '<![endif]-->'+
                '<style type="text/css">'+
                '#outlook a {'+
                'padding:0;'+
                '}'+
                '.es-button {'+
                'mso-style-priority:100!important;'+
                'text-decoration:none!important;'+
                '}'+
                'a[x-apple-data-detectors] {'+
                'color:inherit!important;'+
                'text-decoration:none!important;'+
                'font-size:inherit!important;'+
                'font-family:inherit!important;'+
                'font-weight:inherit!important;'+
                'line-height:inherit!important;'+
                '}'+
                '.es-desk-hidden {'+
                'display:none;'+
                'float:left;'+
                'overflow:hidden;'+
                'width:0;'+
                'max-height:0;'+
                'line-height:0;'+
                'mso-hide:all;'+
                '}'+
                '[data-ogsb] .es-button {'+
                'border-width:0!important;'+
                'padding:10px 20px 10px 20px!important;'+
                '}'+
                '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:center } h2 { font-size:28px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:center } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:28px!important; text-align:center } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:center } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }'+
                '</style>'+
                '</head>'+
                '<body style="width:100%;font-family:georgia, times, \'times new roman\', serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">'+
                '<div class="es-wrapper-color" style="background-color:#AAFACE"><!--[if gte mso 9]>'+
                '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">'+
                '<v:fill type="tile" color="#aaface" origin="0.5, 0" position="0.5, 0"></v:fill>'+
                '</v:background>'+
                '<![endif]-->'+
                '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#AAFACE">'+
                '<tr>'+
                '<td valign="top" style="padding:0;Margin:0">'+
                '<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0">'+
                '<table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">'+
                '<tr>'+
                '<td align="left" style="Margin:0;padding-top:15px;padding-bottom:20px;padding-left:20px;padding-right:20px">'+
                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">'+
                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0;font-size:0px"><img src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" height="150" title="Logo"></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table>'+
                '<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0">'+
                '<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">'+
                '<tr>'+
                '<td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px">'+
                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td align="center" valign="top" style="padding:0;Margin:0;width:560px">'+
                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://kmgkqf.stripocdn.email/content/guids/CABINET_825aab351a0691f7dfce04f0d118350e/images/undraw_programming_re_kg9v.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="300"></td>'+
                '</tr>'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><h1 style="Margin:0;line-height:22px;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-size:18px;font-style:normal;font-weight:bold;color:#333333">Presiona en el bot??n para poder restaurar tu contrase??a, si no reconoces este acci??n ignora este mensaje</h1></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table>'+
                '<table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0">'+
                '<table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">'+
                '<tr>'+
                '<td align="left" style="padding:20px;Margin:0">'+
                '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td align="left" style="padding:0;Margin:0;width:560px">'+
                '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
                '<tr>'+
                '<td align="center" style="padding:0;Margin:0"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#2CB543;border-width:0px 0px 2px 0px;display:inline-block;border-radius:30px;width:auto"><a href="'+link+'" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;border-style:solid;border-color:#31CB4B;border-width:10px 20px 10px 20px;display:inline-block;background:#31CB4B;border-radius:30px;font-family:arial, \'helvetica neue\', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center">Recuperar</a></span></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table></td>'+
                '</tr>'+
                '</table>'+
                '</div>'+
                '</body>'+
                '</html>';
                sendmail(sendemail, "Recuperar Contrase??a", cuerpo);
                res.json({'status':'Enviado'});
            }
        }else{
            mysqlConnection.destroy();
            console.error(err);
            res.json({'status': '??ERROR!'});
        }
    });
});

router.post('/Vericar/Token/Pass', (req, res)=>{ 
    const {token} = req.body;
    var seguir = false
    try{
        const tokend = jwt.verify(token, config);
        seguir = true
    }catch(error){
        res.json({'status': '??ERROR!'});
    }
    if(seguir){
        res.json({'status': 'Valido'});
    }
    
})

router.post('/Recuperar/Password', (req, res)=>{
    const {pass} = req.body;
    const token = req.headers["token"];
    if(!token){
        res.json({'status': '??ERROR!'});
    }else{
        var seguirrr = false
        try{
            const tokend = jwt.verify(token, config);
            seguirrr = true
        }catch(error){
            res.json({'status': '??ERROR!'});
        }
        if(seguirrr){
            const tokend = jwt.verify(token, config);
            var mysqlConnection = conectar();
            const query2 = "update MUsuario set contra_usu = ? where id_usu = ? ";
            mysqlConnection.query(query2, [pass, tokend.UId], (_error, _rows, _fields) =>{
                if(!_error){
                    mysqlConnection.destroy();
                    res.json({'status': 'Cambio Guardado'})
                }else{
                    console.error(_error);
                    mysqlConnection.destroy();
                    res.json({'status': '??ERROR!'})
                }
            });
        }
    }
});

router.post('/Obtener/Punt', (req, res)=>{
    const{id} = req.body;
    var mysqlConnection = conectar();
    const query = 'select mes_punt, cant_punt, id_punt from Puntos where id_usudoc = ? order by id_punt DESC';
    mysqlConnection.query(query, id, (err, rows)=>{
        if(!err){
            mysqlConnection.destroy();
            res.json({
                'status': 'Encontrado',
                'datos': rows
            })
        }else{
            mysqlConnection.destroy();
            console.error(err);
            res.json({'status': '??ERROR!'});
            }
        });
});

router.post('/Ranking/Historico/Actualizado', (req, res)=>{
    const{clave} = req.body;
    if(clave == claveadmin || clave == clavedoc){
        var mysqlConnection = conectar();
        const query = 'select cant_punt, id_usudoc from Puntos';
        mysqlConnection.query(query,(err, rows)=>{
            if(!err){
                mysqlConnection.destroy();
                res.json({
                    'status':'Encontrados',
                    'Datos': rows
                    });
            }else{
                mysqlConnection.destroy();
                console.error(err);
                res.json({'status': '??ERROR!'});
            }
        });
    }else{
        res.json({'status': '??ERROR!'})
    }
});


router.post('/Soporte', (req, res)=>{
    const{correo, fecha, duda, tema} = req.body;
    try{
        var cuerpousuario = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, \'helvetica neue\', helvetica, sans-serif">'+
        '<head>'+
        '<meta charset="UTF-8">'+
        '<meta content="width=device-width, initial-scale=1" name="viewport">'+
        '<meta name="x-apple-disable-message-reformatting">'+
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
        '<meta content="telephone=no" name="format-detection">'+
        '<title>Nueva plantilla</title><!--[if (mso 16)]>'+
        '<style type="text/css">'+
        'a {text-decoration: none;}'+
        '</style>'+
        '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>'+
        '<xml>'+
        '<o:OfficeDocumentSettings>'+
        '<o:AllowPNG></o:AllowPNG>'+
        '<o:PixelsPerInch>96</o:PixelsPerInch>'+
        '</o:OfficeDocumentSettings>'+
        '</xml>'+
        '<![endif]-->'+
        '<style type="text/css">'+
        '#outlook a {'+
        'padding:0;'+
        '}'+
        '.es-button {'+
        'mso-style-priority:100!important;'+
        'text-decoration:none!important;'+
        '}'+
        'a[x-apple-data-detectors] {'+
        'color:inherit!important;'+
        'text-decoration:none!important;'+
        'font-size:inherit!important;'+
        'font-family:inherit!important;'+
        'font-weight:inherit!important;'+
        'line-height:inherit!important;'+
        '}'+
        '.es-desk-hidden {'+
        'display:none;'+
        'float:left;'+
        'overflow:hidden;'+
        'width:0;'+
        'max-height:0;'+
        'line-height:0;'+
        'mso-hide:all;'+
        '}'+
        'td .es-button-border:hover a.es-button-1618490135548 {'+
        'background:#adadad!important;'+
        'border-color:#adadad!important;'+
        '}'+
        'td .es-button-border-1618490135548:hover {'+
        'border-style:solid solid solid solid!important;'+
        'background:#adadad!important;'+
        'border-color:#42d159 #42d159 #42d159 #42d159!important;'+
        '}'+
        '[data-ogsb] .es-button {'+
        'border-width:0!important;'+
        'padding:15px 30px 15px 30px!important;'+
        '}'+
        '[data-ogsb] .es-button.es-button-1636375599453 {'+
        'padding:10px 25px 10px 15px!important;'+
        '}'+
        '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }'+
        '</style>'+
        '</head>'+
        '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">'+
        '<div class="es-wrapper-color" style="background-color:#F7F7F7"><!--[if gte mso 9]>'+
        '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">'+
        '<v:fill type="tile" color="#f7f7f7"></v:fill>'+
        '</v:background>'+
        '<![endif]-->'+
        '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F7F7F7">'+
        '<tr>'+
        '<td valign="top" style="padding:0;Margin:0">'+
        '<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">'+
        '<tr>'+
        '<td align="center" bgcolor="#AAFACE" style="padding:0;Margin:0;background-color:#aaface">'+
        '<table class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">'+
        '<tr>'+
        '<td align="left" style="padding:20px;Margin:0;border-radius:10px 10px 0px 0px;background-color:#ffffff" bgcolor="#ffffff">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:1px" role="presentation">'+
        '<tr>'+
        '<td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#3D7781;font-size:14px"><img src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="120" title="Logo"></a></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table>'+
        '<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">'+
        '<tr>'+
        '<td align="center" bgcolor="#AAFACE" style="padding:0;Margin:0;background-color:#aaface">'+
        '<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#aaface;width:600px" cellspacing="0" cellpadding="0" bgcolor="#AAFACE" align="center">'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;background-color:#ffffff">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:558px">'+
        '<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Gracias por ponerte en contacto con el soporte de quetzual, estaremos al tanto de la duda que nos hiciste llegar y tendremos en cuenta tus comentarios, sin mas quedamos en contacto, muchas gracias.<br><br></p></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://vchpvn.stripocdn.email/content/guids/CABINET_46b83f9afab4c8ab96338910f141a699/images/undraw_interview_re_e5jn_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="433"></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Fecha de Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+fecha+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Tema de Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+tema+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+duda+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="115"></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:270px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="center" style="padding:40px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Soporte Quetzual</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table>'+
        '</div>'+
        '</body>'+
        '</html>'
        sendmail(correo, "Soporte Quetzual", cuerpousuario);

        var cuerpoadmin = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, \'helvetica neue\', helvetica, sans-serif">'+
        '<head>'+
        '<meta charset="UTF-8">'+
        '<meta content="width=device-width, initial-scale=1" name="viewport">'+
        '<meta name="x-apple-disable-message-reformatting">'+
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
        '<meta content="telephone=no" name="format-detection">'+
        '<title>Nueva plantilla</title><!--[if (mso 16)]>'+
        '<style type="text/css">'+
        'a {text-decoration: none;}'+
        '</style>'+
        '<![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>'+
        '<xml>'+
        '<o:OfficeDocumentSettings>'+
        '<o:AllowPNG></o:AllowPNG>'+
        '<o:PixelsPerInch>96</o:PixelsPerInch>'+
        '</o:OfficeDocumentSettings>'+
        '</xml>'+
        '<![endif]-->'+
        '<style type="text/css">'+
        '#outlook a {'+
        'padding:0;'+
        '}'+
        '.es-button {'+
        'mso-style-priority:100!important;'+
        'text-decoration:none!important;'+
        '}'+
        'a[x-apple-data-detectors] {'+
        'color:inherit!important;'+
        'text-decoration:none!important;'+
        'font-size:inherit!important;'+
        'font-family:inherit!important;'+
        'font-weight:inherit!important;'+
        'line-height:inherit!important;'+
        '}'+
        '.es-desk-hidden {'+
        'display:none;'+
        'float:left;'+
        'overflow:hidden;'+
        'width:0;'+
        'max-height:0;'+
        'line-height:0;'+
        'mso-hide:all;'+
        '}'+
        'td .es-button-border:hover a.es-button-1618490135548 {'+
        'background:#adadad!important;'+
        'border-color:#adadad!important;'+
        '}'+
        'td .es-button-border-1618490135548:hover {'+
        'border-style:solid solid solid solid!important;'+
        'background:#adadad!important;'+
        'border-color:#42d159 #42d159 #42d159 #42d159!important;'+
        '}'+
        '[data-ogsb] .es-button {'+
        'border-width:0!important;'+
        'padding:15px 30px 15px 30px!important;'+
        '}'+
        '[data-ogsb] .es-button.es-button-1636375599453 {'+
        'padding:10px 25px 10px 15px!important;'+
        '}'+
        '@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }'+
        '</style>'+
        '</head>'+
        '<body style="width:100%;font-family:arial, \'helvetica neue\', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">'+
        '<div class="es-wrapper-color" style="background-color:#F7F7F7"><!--[if gte mso 9]>'+
        '<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">'+
        '<v:fill type="tile" color="#f7f7f7"></v:fill>'+
        '</v:background>'+
        '<![endif]-->'+
        '<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F7F7F7">'+
        '<tr>'+
        '<td valign="top" style="padding:0;Margin:0">'+
        '<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">'+
        '<tr>'+
        '<td align="center" bgcolor="#AAFACE" style="padding:0;Margin:0;background-color:#aaface">'+
        '<table class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">'+
        '<tr>'+
        '<td align="left" style="padding:20px;Margin:0;border-radius:10px 10px 0px 0px;background-color:#ffffff" bgcolor="#ffffff">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:1px" role="presentation">'+
        '<tr>'+
        '<td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#3D7781;font-size:14px"><img src="https://i.ibb.co/wzX3bzX/Logo-Verde-Letras.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="120" title="Logo"></a></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table>'+
        '<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">'+
        '<tr>'+
        '<td align="center" bgcolor="#AAFACE" style="padding:0;Margin:0;background-color:#aaface">'+
        '<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#aaface;width:600px" cellspacing="0" cellpadding="0" bgcolor="#AAFACE" align="center">'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;background-color:#ffffff">'+
        '<table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:558px">'+
        '<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:28px;color:#000000;font-size:14px">Se hizo el pedido de seguimiento de una duda para el sistema, responde de la manera m??s rapida posible</p></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://vchpvn.stripocdn.email/content/guids/CABINET_46b83f9afab4c8ab96338910f141a699/images/undraw_interview_re_e5jn_1.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="278"></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Correo usuario de consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+correo+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Fecha de Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+fecha+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Tema de Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+tema+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '<tr>'+
        '<td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#ffffff"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">'+
        '<tr>'+
        '<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Consulta</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->'+
        '<table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0;width:360px">'+
        '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">'+
        '<tr>'+
        '<td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, \'helvetica neue\', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">'+duda+'</p></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table><!--[if mso]></td></tr></table><![endif]--></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table></td>'+
        '</tr>'+
        '</table>'+
        '</div>'+
        '</body>'+
        '</html>'
        sendmail('quetzual@gmail.com', "Seguimiento de Soporte", cuerpoadmin);

        res.json({'status': 'Enviados'});

    }catch(error){
        res.json({'status': '??ERROR!'});
    }
});


module.exports = router;