import fs from 'fs';
import { google } from 'googleapis';

async function uploadDrive() {
  console.log("☁️ CHECKING GOOGLE DRIVE CREDENTIALS...");

  const hasCreds =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    fs.existsSync('credentials.json') ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GDRIVE_CREDENTIALS;

  if (!hasCreds) {
    console.warn("⚠️ WARNING: Google Drive credentials not found in environment or workspace.");
    console.warn("📁 Skipping Google Drive upload. Remotion render is safe in 'out/' folder!");
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const targetFolderName = "AI FACTORY OUT-PUT";

    const searchResponse = await drive.files.list({
      q: `name = '${targetFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    let folderId =
      searchResponse.data.files && searchResponse.data.files.length > 0
        ? searchResponse.data.files[0].id
        : null;

    if (!folderId) {
      const folderMetadata = {
        name: targetFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const newFolder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = newFolder.data.id || undefined;
    }

    const outFiles = fs.readdirSync('out');
    const videoFiles = outFiles.filter(file => file.endsWith('.mp4') || file.endsWith('.mov'));

    if (videoFiles.length === 0) {
      throw new Error("❌ No video files found in 'out/' directory!");
    }

    console.log(`📤 Found ${videoFiles.length} video(s) to upload into '${targetFolderName}'...`);

    for (const videoFile of videoFiles) {
      const videoPath = `out/${videoFile}`;
      console.log(`📤 Uploading: ${videoFile}...`);

      const fileMetadata = {
        name: videoFile,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: videoFile.endsWith('.mov') ? 'video/quicktime' : 'video/mp4',
        body: fs.createReadStream(videoPath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      console.log(`🎉 Uploaded ${videoFile} -> Link: ${response.data.webViewLink}`);
    }
  } catch (err: any) {
    console.error("❌ Google Drive upload error:", err.message || err);
  }
}

uploadDrive();
