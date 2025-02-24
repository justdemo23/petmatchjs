const multer = require("multer");
const path = require("path");
const fs = require("fs"); // 🔥 Importar File System

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    
    // Si la carpeta no existe, la crea automáticamente
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const petId = req.params.petId; // Obtener el petId desde la URL
    const uniqueSuffix = `${petId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    return cb(null, true);
  } else {
    cb(new Error("❌ Solo se permiten archivos de imagen."));
  }
};

// Aumentar el tamaño máximo permitido en Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo por imagen
});

module.exports = upload;
