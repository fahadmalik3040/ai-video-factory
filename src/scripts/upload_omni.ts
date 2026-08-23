import * as ftp from "basic-ftp";
import fs from "node:fs";
import path from "node:path";

export interface FtpDestination {
  name: string;
  host: string;
  user?: string;
  password?: string;
  port?: number;
  secure?: boolean;
}

export interface MetadataPayload {
  title: string;
  description: string;
  keywords: string[];
  filename: string;
}

// Generate CSV Metadata file for Stock Agencies (Adobe, Shutterstock, Pond5)
export function generateStockCsv(metadataList: MetadataPayload[], outputPath: string): void {
  const headers = ["Filename", "Title", "Description", "Keywords", "Category"];
  const rows = metadataList.map((meta) => {
    const cleanTitle = `"${meta.title.replace(/"/g, '""')}"`;
    const cleanDesc = `"${meta.description.replace(/"/g, '""')}"`;
    const cleanKeywords = `"${meta.keywords.join(", ").replace(/"/g, '""')}"`;
    return `${meta.filename},${cleanTitle},${cleanDesc},${cleanKeywords},Motion Graphics`;
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  fs.writeFileSync(outputPath, csvContent, "utf8");
  console.log(`📄 [Omni-FTP] CSV Metadata Generated: ${outputPath}`);
}

export async function uploadToFtp(destination: FtpDestination, filesToUpload: string[]): Promise<boolean> {
  if (!destination.user || !destination.password) {
    console.log(`⏭️ [Omni-FTP] Skipping ${destination.name}: Missing credentials in environment variables.`);
    return false;
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log(`🔌 [Omni-FTP] Connecting to ${destination.name} (${destination.host})...`);
    await client.access({
      host: destination.host,
      user: destination.user,
      password: destination.password,
      port: destination.port || 21,
      secure: destination.secure || false,
    });

    console.log(`✅ [Omni-FTP] Connected to ${destination.name}! Initiating sequential upload...`);

    for (const filePath of filesToUpload) {
      if (fs.existsSync(filePath)) {
        const remoteFileName = path.basename(filePath);
        console.log(`  ⬆️ Uploading ${remoteFileName} to ${destination.name}...`);
        await client.uploadFrom(filePath, remoteFileName);
        console.log(`  ✅ Successfully uploaded ${remoteFileName} to ${destination.name}`);
      } else {
        console.warn(`  ⚠️ Local file not found for upload: ${filePath}`);
      }
    }

    return true;
  } catch (err: any) {
    console.error(`❌ [Omni-FTP] Error uploading to ${destination.name}:`, err.message);
    return false;
  } finally {
    client.close();
  }
}

export async function runOmniDistribution(jobIndexStr?: string): Promise<void> {
  const jobIndex = jobIndexStr || process.env.JOB_INDEX || "0";
  const projectRoot = process.cwd();
  const outDir = path.resolve(projectRoot, "out");

  console.log(`\n=======================================================================`);
  console.log(`🌐 OMNI-PLATFORM FTP DISTRIBUTOR FOR JOB ${jobIndex}`);
  console.log(`=======================================================================`);

  // Target Destination Endpoints
  const destinations: FtpDestination[] = [
    {
      name: "Adobe Stock",
      host: process.env.ADOBE_FTP_HOST || "ftp.stock.adobe.com",
      user: process.env.ADOBE_FTP_USER,
      password: process.env.ADOBE_FTP_PASSWORD || process.env.ADOBE_FTP_PASS,
      port: 21,
      secure: false,
    },
    {
      name: "Shutterstock",
      host: process.env.SHUTTERSTOCK_FTP_HOST || "ftps.shutterstock.com",
      user: process.env.SHUTTERSTOCK_FTP_USER,
      password: process.env.SHUTTERSTOCK_FTP_PASSWORD || process.env.SHUTTERSTOCK_FTP_PASS,
      port: 21,
      secure: true,
    },
    {
      name: "Pond5",
      host: process.env.POND5_FTP_HOST || "ftp.pond5.com",
      user: process.env.POND5_FTP_USER,
      password: process.env.POND5_FTP_PASSWORD || process.env.POND5_FTP_PASS,
      port: 21,
      secure: false,
    },
  ];

  // Collect Rendered Media Files
  const video3D = path.resolve(outDir, `output_${jobIndex}_3d.mp4`);
  const video2D = path.resolve(outDir, `output_${jobIndex}_2d.mp4`);
  const universalVideo = path.resolve(outDir, "output.mp4");

  const filesToDistribute: string[] = [];
  if (fs.existsSync(video3D)) filesToDistribute.push(video3D);
  if (fs.existsSync(video2D)) filesToDistribute.push(video2D);
  if (filesToDistribute.length === 0 && fs.existsSync(universalVideo)) {
    filesToDistribute.push(universalVideo);
  }

  // Load Metadata
  const metaPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  let metadataList: MetadataPayload[] = [];
  if (fs.existsSync(metaPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      const title = data.seoPackage?.title || `4K Procedural Stock Video #${jobIndex}`;
      const description = data.seoPackage?.description || "High-end 4K abstract stock motion graphics.";
      const keywords = data.seoPackage?.seoTags || ["4k", "stock video", "vfx", "motion graphics"];

      filesToDistribute.forEach((file) => {
        metadataList.push({
          filename: path.basename(file),
          title,
          description,
          keywords,
        });
      });
    } catch {
      // Ignore JSON parse warning
    }
  }

  // Generate metadata CSV
  const csvPath = path.resolve(outDir, `metadata_${jobIndex}.csv`);
  if (metadataList.length > 0) {
    generateStockCsv(metadataList, csvPath);
    filesToDistribute.push(csvPath);
  }

  if (filesToDistribute.length === 0) {
    console.log(`ℹ️ [Omni-FTP] No output files detected in out/ directory to upload.`);
    return;
  }

  console.log(`📦 Files queued for distribution (${filesToDistribute.length}):`);
  filesToDistribute.forEach((f) => console.log(`   - ${path.basename(f)}`));

  // Sequentially upload to all configured stock agencies
  for (const destination of destinations) {
    console.log(`\n-------------------------------------------------------------`);
    await uploadToFtp(destination, filesToDistribute);
  }

  console.log(`\n🎉 [OMNI-FTP COMPLETE] All distribution endpoints processed for Job ${jobIndex}.`);
}

if (require.main === module) {
  runOmniDistribution();
}
