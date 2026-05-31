import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // Fallback to local storage if Cloudinary is not configured
        if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
            console.log("Cloudinary not configured. Falling back to local storage.");
            const filename = path.basename(localFilePath);
            const targetDir = "./public/uploads/logos";
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, filename);
            fs.copyFileSync(localFilePath, targetPath);
            fs.unlinkSync(localFilePath);
            
            return {
                url: `http://localhost:8000/uploads/logos/${filename}`
            };
        }

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //console.log("file uploaded successfully",response.url)
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        
        // Fallback to local storage if Cloudinary upload fails
        try {
            console.log("Attempting local fallback after Cloudinary upload error.");
            const filename = path.basename(localFilePath);
            const targetDir = "./public/uploads/logos";
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path.join(targetDir, filename);
            fs.copyFileSync(localFilePath, targetPath);
            fs.unlinkSync(localFilePath);
            
            return {
                url: `http://localhost:8000/uploads/logos/${filename}`
            };
        } catch (fallbackError) {
            console.error("Local fallback upload error:", fallbackError);
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
            return null;
        }
    }
}

export {uploadOnCloudinary}