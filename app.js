//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
const multer = require('multer');

const upload = multer({ dest: 'imagenes/' });

const app = express();
const port = 3000;
// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '10.0.6.39',
    user: 'estudiante',
    password: 'Info-2023',
    database: 'HeladeriaBO'
});

// Middleware para parsear el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos de la carpeta 'imagenes'
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Ruta para servir el formulario HTML
app.use(express.static(path.join(__dirname, 'pagina_principal')));


//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});
//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla

//Metodo post para registrar un usuario
app.post('/registrar_usuario', (req, res) =>{
    //Rescato los datos de la url
    const {correo, contraseña, rol} = req.body;
    const sql = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
    connection.query(sql, [correo, contraseña, rol], (err, result) =>{
        if(err){
            console.error('Error al regstrar el usuario', err);
        }else{
            console.log('Usuario se registro exitosamente');
            res.redirect('/');
        }
    });
});
//Ruta o peticion para iniciar sesion
app.post('/iniciar_sesion', (req, res) =>{
    const {correo, contraseña} = req.body;
    //Defino una consulta SQL para obtener el rol del usuario
    const sql = 'SELECT rol FROM usuarios WHERE correo = ? AND contraseña = ?';
    //Ejecuto la consulta y paso los datos a la consulta
    connection.query(sql, [correo,contraseña], (err, result) =>{
        if(err){
            console.error('Error al iniciar sesion', err);
            res.send('Error al Iniciar Sesion');
        //Si existe por lo menus 1 resultado de la consulta SQL
        }else if(result.length > 0){
            const rol = result[0].rol;
            if(rol === 1){
                res.redirect('/listardatos.html');
            }else if(rol === 2){
                res.redirect('/usuario.html');
            }
        }else{
            res.send('Correo o Clave Incorrectos');
        }
    });
});

app.post('/guardar_helado',(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio], (err, result) => {
        if (err) throw err;
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID
app.get('/helados/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos de la película:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Película no encontrada');
            return;
        }
        // Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});




app.post('/subir_imagenes', upload.single('imagen'), (req, res) => {
    const { nombre, descripcion } = req.body;
    const imagen = req.file.filename;
    const query = 'INSERT INTO imagenes (nombre, descripcion, imagen) VALUES (?, ?, ?)';
    connection.query(query, [nombre, descripcion, imagen], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});


app.get('/imagenes', (req, res) => {
    const query = 'SELECT nombre, descripcion, imagen FROM imagenes';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al obtener los datos de la base de datos.');
            return;
        }
        res.json(results);
    });
    
});

app.delete('/eliminar_helado/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Helado WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el helado:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        console.log('Helado eliminado correctamente.');
        res.sendStatus(200);
    });
});




//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

