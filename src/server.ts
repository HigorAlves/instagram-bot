import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers';

async function Init() {
	const browser = await Puppeteer.launch({ headless: false });
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	await insta.login();
	browser.close();
}

Init();
