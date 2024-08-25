let cropper;
let cropButton = document.getElementById('cropButton');
let imagetoCrop = document.getElementById('image');
let imagecropdiv = document.getElementById('imagecropdiv');
let cropimage = document.getElementById('imageToCrop');
let croppedBlob = null;
let imgView = document.getElementById("imgView")
let reduceButton = document.getElementById("reduceButton")
const abortController = new AbortController(); // Create AbortController
const signal = abortController.signal


async function getFileFromImgSrc() {
    // Fetch the image as a Blob
    try{
        console.log(imagetoCrop.files[0]);
    
    let img = imagetoCrop.files[0].name.split('.')[0];
    console.log(img);
    
    const response = await fetch(imgView.src);
    const blob = await response.blob();
    
    // Optionally convert Blob to File
    const file = new File([blob], img, { type: blob.type });
    console.log(file);
    
    return file;
    }catch(err) {
        console.log(err);
        
    }
    
}
async function handleCropImage(e) {
    const file = await getFileFromImgSrc()
    console.log(file);
    
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            cropimage.src = event.target.result; // Set image source
            cropimage.onload = function() {
                imagecropdiv.style.display = "block"; // Show image container

                // Initialize Cropper.js
                if (cropper) {
                    cropper.destroy(); // Destroy the previous cropper instance if any
                }
                cropper = new Cropper(cropimage, {
                    responsive: true,
                    restore: true,
                    guides: true,
                    center: true,
                    highlight: true,
                    background: true,
                    movable: true,
                    scalable: true,
                    viewMode: 1,
                });

                // Show the crop button
                cropButton.style.display = "inline-block";
            };
        };
        fileReader.readAsDataURL(file); // Read the image as a data URL
    }
}

function cropImage() {
    if (cropper) {
        cropper.getCroppedCanvas({width:1584, height: 850}).toBlob((blob) => {
            croppedBlob = blob;
            console.log(blob, "blob");
            
            document.getElementById("imgView").src = URL.createObjectURL(blob);
            imagecropdiv.style.display = "none"; // Hide cropping UI after saving
        }, 'image/png');
    }
}

function cancelCrop() {
    imagecropdiv.style.display = "none"; // Hide cropping UI
}

function viewImage(event) {
    imgView.style.display = 'block'
    document.getElementById("imgView").src = URL.createObjectURL(event.target.files[0]);

    if(event.target.files[0]) {
        cropButton.style.display = "inline-flex";
        reduceButton.style.display = "inline-flex"
    }
}


async function reduceImageSize () {

    const options = {
        maxSizeMB: 1, 
        onProgress: (progress) => {
            // Update progress bar
            document.getElementById('progressBar').style.display = 'block'
            const progressBar = document.getElementById('progressBar').firstElementChild;
            progressBar.style.width = progress + '%';
        } ,  
        signal: signal,     
        useWebWorker: true,
    };

    try {
        // Compress the image file
        const file = await getFileFromImgSrc()
        document.getElementById('cancelReduceButton').style.display = "inline-block"
        const compressedFile = await imageCompression(file, options);
        document.getElementById('cancelReduceButton').style.display = "none"
        toastr.success("Image file size reduced successfully");
        setTimeout(() => {
            document.getElementById('progressBar').style.display = 'none';
        }, 2000);
        // Display compressed image
        const compressedImageUrl = URL.createObjectURL(compressedFile);
        imgView.src = compressedImageUrl;

        // If you need to upload the compressed image, you can use `compressedFile`
        console.log('Compressed File:', compressedFile);
    } catch (error) {
        if(error) {
            document.getElementById('cancelReduceButton').style.display = "none"
            document.getElementById('progressBar').style.display = 'none';
        }
    }

}

document.getElementById('cancelReduceButton').addEventListener('click', () => {
    abortController.abort(); // Trigger the abort signal
    console.log('Compression canceled by user.');
});