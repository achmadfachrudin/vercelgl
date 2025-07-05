import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { html } = req.body;

  try {
    const executablePath = await chromium.executablePath();
    console.log("🧠 Chromium executablePath:", executablePath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '58mm',
      height: undefined,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('Render error:', err);
    res.status(500).json({ error: err.toString() });
  }
}
