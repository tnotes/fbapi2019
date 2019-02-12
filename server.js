const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const route = require('./route/route');
app.use(cors());
app.use(bodyParser.json({limit: '500mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
app.use('/api',route);
app.get('/',(req,res)=>{
   res.send('API connected');
});
app.listen(9191);
