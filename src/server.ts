import express = require('express');
import routes from './routes';

const app: express.Application = express();

app.use(routes);

app.listen(8080, () => {
    console.log(`Ewally API voando na porta 8080 🚀
Teste em seu navegador http://localhost:8080/boleto/21290001192110001210904475617405975870000002000`)
});