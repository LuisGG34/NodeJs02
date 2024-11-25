import express from "express";
import path from "path";
import { writeFile, readFile } from "node:fs/promises";
import cors from "cors";

const app = express();
const puerto = 3000;

// Habilitar CORS
app.use(cors());

// Configuración de middlewares
app.use(express.json());

// Servir el archivo index.html desde la carpeta Client
const __dirname = path.resolve();
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Función para leer el repertorio
const obtenerCanciones = async () => {
    try {
        const datos = await readFile("repertorio.json", "utf-8");
        return JSON.parse(datos);
    } catch (error) {
        console.error("Error al leer el archivo:", error);
        return [];
    }
};

// Función para guardar el repertorio
const guardarCanciones = async (canciones) => {
    try {
        await writeFile("repertorio.json", JSON.stringify(canciones, null, 2));
    } catch (error) {
        console.error("Error al guardar el archivo:", error);
    }
};

// Rutas CRUD

// Obtener todas las canciones
app.get("/canciones", async (req, res) => {
    const canciones = await obtenerCanciones();
    res.json(canciones);
});

// Obtener una canción por ID
app.get("/canciones/:id", async (req, res) => {
    const { id } = req.params;
    const canciones = await obtenerCanciones();
    const cancion = canciones.find((c) => c.id === parseInt(id));
    if (cancion) {
        res.json(cancion);
    } else {
        res.status(404).json({ mensaje: "Canción no encontrada" });
    }
});

// Crear una nueva canción
app.post("/canciones", async (req, res) => {
    const nuevaCancion = req.body;
    nuevaCancion.id = Number(nuevaCancion.id); // Asegurar que el ID sea un número
    const canciones = await obtenerCanciones();
    canciones.push(nuevaCancion);
    await guardarCanciones(canciones);
    res.json(nuevaCancion);
});

// Editar una canción
app.put("/canciones/:id", async (req, res) => {
    const { id } = req.params;
    const nuevaInfo = req.body;
    const canciones = await obtenerCanciones();
    const indice = canciones.findIndex((c) => c.id === parseInt(id));

    if (indice !== -1) {
        canciones[indice] = { 
            ...canciones[indice], 
            ...nuevaInfo, 
            id: parseInt(id) // Asegurar que el ID permanezca como número
        };
        await guardarCanciones(canciones);
        res.send("Canción modificada con éxito");
    } else {
        res.status(404).send("Canción no encontrada");
    }
});

// Eliminar una canción
app.delete("/canciones/:id", async (req, res) => {
    const { id } = req.params;
    const canciones = await obtenerCanciones();
    const indice = canciones.findIndex((c) => c.id === parseInt(id));

    if (indice !== -1) {
        canciones.splice(indice, 1);
        await guardarCanciones(canciones);
        res.send("Canción eliminada con éxito");
    } else {
        res.status(404).send("Canción no encontrada");
    }
});

// Iniciar el servidor
app.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});



