import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import Log from '@/Lib/Logger';

const filePath = path.resolve(path.join('.', '/src', '/Database', '/Cookies'), 'cookies.json');

export async function saveCookies(page: Puppeteer.Page): Promise<void> {
	const cookies = await page.cookies();
	await fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
}

export async function loadCookies(page: Puppeteer.Page): Promise<void> {
	try {
		const cookiesString = await fs.readFileSync(filePath);
		const cookies = JSON.parse(cookiesString.toString());
		await page.setCookie(...cookies);
	} catch (error) {
		if (error.code === 'ENOENT') {
			Log('WARN', 'There is no cookie file');
		}
	}
}
