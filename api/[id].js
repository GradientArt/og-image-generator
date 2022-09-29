import chromium from 'chrome-aws-lambda';
import playwright from 'playwright-core';

const ALLOWED_ORIGINS = [
    'https://dient.art',
    'https://gra.dient.art',
];

export default async (req, res) => {
    try {
        if (!ALLOWED_ORIGINS.includes(req.headers.host)) {
            throw 'Invalid origin';
        }
        const executablePath = process.env.NODE_ENV === 'development' ? undefined : await chromium.executablePath;
        const browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath,
            headless: chromium.headless,
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://gra.dient.art/embed/' + req.query.id)
        await page.setViewportSize({width: 1200, height: 720});
        const image = await page.screenshot();
        await browser.close();
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 's-maxage=31536000, max-age=31536000, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', req.headers.host);
        res.status(200);
        res.end(image, 'binary');
    } catch(e) {
        console.error(e);
        res.end();
    }
};