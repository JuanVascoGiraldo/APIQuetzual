const express = require('express');
const app = express();

//Setings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json());
//Routes

app.use( '/quetzual/usuario', require('./Routes/usuario'));
app.use( '/quetzual/pregunta', require('./Routes/preguntas'));
app.use( '/quetzual/respuesta', require('./Routes/respuestas'));
app.use( '/quetzual/Doctor', require('./Routes/Doctor'));

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});