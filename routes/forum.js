const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const badWords = require('../config/badWords');

const router = express.Router();

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/forum/');  // Carpeta para imágenes del foro
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Función para detectar palabras ofensivas
const containsBadWords = (text) => {
    const words = text.toLowerCase().match(/\b(\w+)\b/g);  // Divide el texto en palabras exactas

    if (!words) return false;  // Si no hay palabras, no hay problema

    return words.some(word => badWords.includes(word));
};

// ---------------------- ENDPOINTS DEL FORO ---------------------- //

// 1. Crear una publicación (con o sin imagen)
router.post('/posts', upload.single('image'), async (req, res) => {
    const { user_id, title, content } = req.body;
    const imagePath = req.file ? `/uploads/forum/${req.file.filename}` : null;

    // Verificar si el contenido tiene palabras ofensivas
    if (containsBadWords(title) || containsBadWords(content)) {
        return res.status(400).json({ message: 'El título o contenido contiene lenguaje inapropiado.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)',
            [user_id, title, content]
        );

        const postId = result.insertId;

        if (imagePath) {
            await db.execute(
                'INSERT INTO forum_images (post_id, filepath) VALUES (?, ?)',
                [postId, imagePath]
            );
        }

        res.status(201).json({ message: 'Publicación creada exitosamente', postId, imagePath });
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 2. Ver todas las publicaciones con sus imágenes
router.get('/posts', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.id, p.title, p.content, p.created_at, u.first_name, u.last_name, i.filepath AS image
            FROM forum_posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN forum_images i ON p.id = i.post_id
            ORDER BY p.created_at DESC
        `);

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 3. Comentar en una publicación
router.post('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { user_id, comment } = req.body;

    // Verificar si el comentario tiene palabras ofensivas
    if (containsBadWords(comment)) {
        return res.status(400).json({ message: 'El comentario contiene lenguaje inapropiado.' });
    }

    try {
        await db.execute(
            'INSERT INTO forum_comments (post_id, user_id, comment) VALUES (?, ?, ?)',
            [postId, user_id, comment]
        );

        res.status(201).json({ message: 'Comentario agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 4. Ver comentarios de una publicación
router.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;

    try {
        const [comments] = await db.execute(`
            SELECT c.id, c.comment, c.created_at, u.first_name, u.last_name
            FROM forum_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `, [postId]);

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;