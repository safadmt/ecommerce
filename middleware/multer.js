import multer from "multer";
import path from 'path'

// Function to handle file uploads for product images
function uploadFile () {
  // Configure multer storage for product images
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          // Set the destination folder for product images
          cb(null, './public/products/images')
        },
        filename: function (req, file, cb) {
          // Create a unique suffix using the current timestamp and a random number
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const extname = path.extname(file.originalname)
          // Set the filename with the unique suffix and extension
          cb(null, file.fieldname + '-' + uniqueSuffix + "." + extname)
        }
      })
       // Initialize multer with the configured storage and file filter
    const upload = multer(({storage: storage,
        fileFilter: function (req,file,cb) {
          // Allow only image files with specific extensions
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
          }
          cb(null, true);// Accept the file
        }}))
        // Middleware function to handle multiple file uploads (max 4 files)
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
// Function to handle file uploads for banner images
function uploadBannerFile () {
  // Configure multer storage for banner images
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // Set the destination folder for banner images
        cb(null, './public/banners')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extname = path.extname(file.originalname) // Get the file extension
       // Set the filename with the unique suffix and extension
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + extname)
      }
    })
    // Initialize multer with the configured storage and file filter
  const upload = multer(({storage: storage,
      fileFilter: function (req,file,cb) {
        // Allow only image files with specific extensions
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true); // Accept the file
      }}))
      // Middleware function to handle single file upload
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