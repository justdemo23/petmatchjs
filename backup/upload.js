const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    const petId = req.params.petId;  // Obtener el petId desde la URL
    const uniqueSuffix = `${petId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);  // El nombre de la imagen será petId + timestamp
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes en formato JPEG, JPG y PNG'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
