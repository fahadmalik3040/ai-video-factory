import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function uploadDrive() {
  console.log("☁️ STARTING GOOGLE DRIVE UPLOAD & SEO GENERATION...");

  try {
    const credentialsEnv = process.env.GDRIVE_CREDENTIALS;
    if (!credentialsEnv) {
      console.warn("⚠️ GDRIVE_CREDENTIALS env variable missing. Skipping Google Drive upload.");
      return;
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsEnv);
    } catch {
      credentials = JSON.parse(fs.readFileSync(credentialsEnv, 'utf-8'));
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    const sceneDataPath = path.join('data', 'sceneData.json');
    if (!fs.existsSync(sceneDataPath)) {
      throw new Error(`Scene data not found at ${sceneDataPath}`);
    }

    const sceneData = JSON.parse(fs.readFileSync(sceneDataPath, 'utf-8'));
    const title = sceneData.title || "Untitled Video";
    const theme = sceneData.theme || "technology";

    const uniqueId = "VID_" + uuidv4().substring(0, 6).toUpperCase();
    const folderName = `${uniqueId} - ${title}`;

    const parentFolderId = process.env.GDRIVE_PARENT_ID;
    console.log(`📁 Creating Drive folder: "${folderName}"...`);

    const folderRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      },
      fields: 'id'
    });

    const folderId = folderRes.data.id;
    console.log(`✅ Folder created with ID: ${folderId}`);

    if (!fs.existsSync('out')) {
      fs.mkdirSync('out', { recursive: true });
    }

    const seoContent = `Title: ${title}\nID: ${uniqueId}\n\nDescription: A cinematic 4K abstract representation of ${title}. Generated procedurally.\n\nPrompt: ${title}\n\nTags: #Abstract #4K #MotionGraphics #${theme}`;
    const seoFilePath = path.join('out', 'seo_metadata.txt');
    fs.writeFileSync(seoFilePath, seoContent);
    console.log("📝 SEO Metadata generated.");

    const videoPath = path.join('out', 'final_video.mp4');

    // Upload Video if present
    if (fs.existsSync(videoPath)) {
      console.log("📹 Uploading final_video.mp4 to Google Drive...");
      await drive.files.create({
        requestBody: {
          name: `${uniqueId}_final_video.mp4`,
          parents: folderId ? [folderId] : undefined
        },
        media: {
          mimeType: 'video/mp4',
          body: fs.createReadStream(videoPath)
        }
      });
      console.log("✅ Video uploaded.");
    } else {
      console.warn(`⚠️ Video file not found at ${videoPath}, skipping video upload.`);
    }

    // Upload SEO Metadata
    if (fs.existsSync(seoFilePath)) {
      console.log("📄 Uploading seo_metadata.txt to Google Drive...");
      await drive.files.create({
        requestBody: {
          name: 'seo_metadata.txt',
          parents: folderId ? [folderId] : undefined
        },
        media: {
          mimeType: 'text/plain',
          body: fs.createReadStream(seoFilePath)
        }
      });
      console.log("✅ SEO Metadata uploaded.");
    }

    // Clean up local out directory
    console.log("🧹 Cleaning up local output directory...");
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(seoFilePath)) fs.unlinkSync(seoFilePath);

    console.log("🎉 GOOGLE DRIVE UPLOAD & CLEANUP COMPLETE!");
  } catch (error) {
    console.error("❌ Drive upload failed:", error);
    process.exit(1);
  }
}

uploadDrive();
