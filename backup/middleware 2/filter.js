const badWords = require('../config/badWords');
const db = require('../db');

const filterBadWords = async (req, res, next) => {
    const { user_id, content } = req.body;

    // Convertir a minúsculas para detectar variaciones
    const lowerContent = content.toLowerCase();

    // Verificar si hay palabras prohibidas
    const foundBadWord = badWords.find(word => lowerContent.includes(word));

    if (foundBadWord) {
        // Registrar la infracción
        await db.execute(
            'INSERT INTO infractions (user_id, reason) VALUES (?, ?)',
            [user_id, `Uso de lenguaje inapropiado: "${foundBadWord}"`]
        );

        // Verificar cuántas infracciones tiene el usuario
        const [infractions] = await db.execute(
            'SELECT COUNT(*) as count FROM infractions WHERE user_id = ?',
            [user_id]
        );

        const infractionCount = infractions[0].count;

        if (infractionCount >= 3) {
            // Ban permanente después de 3 infracciones
            await db.execute(
                'INSERT INTO bans (user_id, ban_type) VALUES (?, ?)',
                [user_id, 'permanent']
            );
            return res.status(403).json({ message: 'Has sido baneado permanentemente por lenguaje inapropiado.' });
        } else if (infractionCount === 2) {
            // Ban temporal después de 2 infracciones
            const unbanDate = new Date();
            unbanDate.setDate(unbanDate.getDate() + 7);  // Ban por 7 días

            await db.execute(
                'INSERT INTO bans (user_id, ban_type, unban_at) VALUES (?, ?, ?)',
                [user_id, 'temporary', unbanDate]
            );

            return res.status(403).json({ message: 'Has sido suspendido por 7 días debido a lenguaje inapropiado.' });
        } else {
            // Primera infracción: advertencia
            return res.status(200).json({ message: 'Advertencia: Has usado lenguaje inapropiado.' });
        }
    }

    next();  // Si no hay palabras ofensivas, continúa con el siguiente middleware
};

module.exports = filterBadWords;
