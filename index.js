const express = require('express');
const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
	res.send({ req });
});

app.listen(PORT);
