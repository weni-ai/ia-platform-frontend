import express from 'express';
import cors from 'cors';
import Intelligence from './intelligence/index.mjs';
import Nexus from './nexus/index.mjs';
import axios from 'axios';
import config from './config.mjs';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/intelligence', Intelligence);
app.use('/nexus', Nexus);

app.all('*', (req, res) => {
  const url = req.path.replace(/^\/(nexus|intelligence)/, (_, name) => {
    return config[name];
  });

  axios({
    method: req.method,
    url,
    data: req.body,
    headers: {
      Authorization: req.headers.authorization,
    },
  }).then((response) => {
    res.json(response.data);
  });
});

app.listen(port, () => {
  console.log(`Mock API listening on port ${port}`);
});
