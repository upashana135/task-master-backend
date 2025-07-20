const express = require("express");
const cors = require('cors');

const app = express();
app.set('trust proxy', 1); 
app.use(express.json())

const allowedOrigins = [
  'http://127.0.0.1:3000',
  'https://tm.upashana.me'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = 3000;

const routes = require("./src/route")

app.use('/api', routes);

// app.listen(PORT, () => {
//     console.log(`Server is running at: ${PORT}`)
// });

app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on port 3001');
});
