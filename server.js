const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: "*"
}

// middlewaress

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({extended: true}));

// routes
const kycRoute = require('./routes/kycRoutes')
app.use('/api', kycRoute)



// testing...

app.get('/', (req, res) => {
    res.json({message: 'Hello APi'})
})

const PORT = process.env.PORT || 1000;

app.listen(PORT, () =>{
    console.log('server is listening to port '+PORT);
})