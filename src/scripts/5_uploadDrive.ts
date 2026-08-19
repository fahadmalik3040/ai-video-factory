import fs from 'fs';
import { google } from 'googleapis';

async function uploadDrive() {
  console.log("☁️ SEARCHING FOR 'AI FACTORY OUT-PUT' FOLDER ON GOOGLE DRIVE...");

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });
  const targetFolderName = "AI FACTORY OUT-PUT";

  try {
    // 1. Search if "AI FACTORY OUT-PUT" folder already exists
    const searchResponse = await drive.files.list({
      q: `name = '${targetFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    let folderId = searchResponse.data.files && searchResponse.data.files.length > 0 
      ? searchResponse.data.files[0].id 
      : null;

    // 2. If it doesn't exist, create it automatically
    if (!folderId) {
      console.log(`📁 Folder '${targetFolderName}' not found on Drive. Creating it now...`);
      const folderMetadata = {
        name: targetFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const newFolder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = newFolder.data.id || undefined;
      console.log(`✅ Created new Google Drive folder '${targetFolderName}' with ID: ${folderId}`);
    } else {
      console.log(`✅ Found existing Google Drive folder '${targetFolderName}' (ID: ${folderId})`);
    }

    // 3. Find the rendered video in 'out/' folder
    const outFiles = fs.readdirSync('out');
    const videoFile = outFiles.find(file => file.endsWith('.mp4'));

    if (!videoFile) {
      throw new Error("❌ No MP4 video found in 'out/' directory to upload!");
    }

    const videoPath = `out/${videoFile}`;
    console.log(`📤 Uploading video file: ${videoFile} into '${targetFolderName}' folder...`);

    const fileMetadata = {
      name: videoFile,
      parents: folderId ? [folderId] : [],
    };
    
    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(videoPath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    console.log(`🎉 SUCCESS! Video uploaded inside 'AI FACTORY OUT-PUT'.`);
    console.log(`🔗 Link: ${response.data.webViewLink}`);

  } catch (err: any) {
    console.error("❌ Google Drive upload failed:", err.message || err);
    process.exit(1);
  }
}

uploadDrive();
