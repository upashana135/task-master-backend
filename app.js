const express = require("express");
const cors = require('cors');

const app = express();
app.use(express.json())

const corsOptions = {
  origin: ['http://127.0.0.1:3001', 'https://tm.upashana.me'], 
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
