const express = require('express');
const app = express();

//Setings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json());
//Routes

app.use( '/quetzual/usuario', require('./routes/usuario'));
app.use( '/quetzual/pregunta', require('./routes/preguntas'));
app.use( '/quetzual/respuesta', require('./routes/respuestas'));

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});