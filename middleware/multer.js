import multer from "multer";
import path from 'path'

function uploadFile () {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/products/images')
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const extname = path.extname(file.originalname)
        console.log(extname)
        console.log(file)
          cb(null, file.fieldname + '-' + uniqueSuffix + "." + extname)
        }
      })

    const upload = multer(({storage: storage,
        fileFilter: function (req,file,cb) {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
          }
          cb(null, true);
        }}))
        return (req, res, next) => {
          upload.array('files',4)(req, res, (err) => {
            if (err) {
              
              // Handle the error and send it to the client
              res.status(400).json({ error: err.message });
            } else {
              // Files were uploaded successfully
              next();
            }
          });
        };
}

function uploadBannerFile () {
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/banners')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extname = path.extname(file.originalname)
        console.log(extname)
        console.log(file)
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + extname)
      }
    })

  const upload = multer(({storage: storage,
      fileFilter: function (req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      }}))
      return (req, res, next) => {
        upload.single('image')(req, res, (err) => {
          if (err) {
            
            // Handle the error and send it to the client
            res.status(400).json({ error: err.message });
          } else {
            // Files were uploaded successfully
            next();
          }
        });
      };
}
export  {uploadFile,uploadBannerFile};