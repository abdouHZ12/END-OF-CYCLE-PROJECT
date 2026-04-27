import puppeteer, { Browser } from 'puppeteer';
import QRCode from 'qrcode';
import os from 'node:os';

import { prisma } from '../../../lib/prisma.js';
import { config } from '../../../config/config.js';
import { httpError } from '../../../common/errors.js';
import { toInt } from '../../../common/parsing.js';

let browser: Browser | undefined;

export const initBrowser = async (): Promise<void> => {
  if (browser) return;

  const options: Parameters<typeof puppeteer.launch>[0] = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  if (process.env.CHROME_PATH) {
    options.executablePath = process.env.CHROME_PATH;
  }

  browser = await puppeteer.launch(options);
};

export const closeBrowser = async (): Promise<void> => {
  if (!browser) return;
  await browser.close();
  browser = undefined;
};

function getLocalIP(): string {
  return (
    Object.values(os.networkInterfaces())
      .flat()
      .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address || 'localhost'
  );
}

export const GeneratePdf = async (id: any) => {
  const documentId = toInt(id, 'id');

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      decisionMadeBy: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  if (!document) throw httpError(404, 'Document not found');
  if (!document.qrCode) throw httpError(400, 'Document has no QR code');

  const baseUrl =
    config.nodeEnv === 'production'
      ? config.clientUrl
      : `http://${getLocalIP()}:3000`;

  const url = `${baseUrl}/scan?token=${document.qrCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(url);

  const html = `<!DOCTYPE html>
    <html>
        <head>
            <style>
            body { font-family: Arial; padding: 40px; }
            .container { border: 1px solid #000; padding: 20px; }
            .title { text-align: center; font-size: 24px; font-weight: bold; }
            .qr { margin-top: 30px; text-align: center; }
            .content { display: flex; gap: 24px; align-items: flex-start; margin-top: 24px; }
            .info { flex: 1; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="title">Approved Document</div>
                <div class="content">
                    <div class="info">
                        <p><strong>User:</strong> ${document.id}</p>
                        <p><strong>Type:</strong> ${document.type}</p>
                        <p><strong>Date:</strong> ${new Date(document.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="qr">
                        <img src="${qrCodeDataUrl}" width="150" height="150" />
                        <p>Scan to verify</p>
                    </div>
                </div>
            </div>
        </body>
    </html>`;

  if (!browser) throw new Error('Browser not initialized. Call initBrowser() first.');

  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return pdfBuffer;
  } finally {
    await page.close();
  }
};
