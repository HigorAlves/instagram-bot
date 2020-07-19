import Puppeteer from 'puppeteer';

import { CHROMIUM_OPTIONS } from '@/Constants';
import Bot from '@/Controllers/Bot';
import Log from '@/Lib/Logger';

async function init() {
	Log('INFO', 'Bot has been initialized');

	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS);
	const page = (await browser.pages())[0];
	const bot = new Bot(page, browser);

	await bot.init();
	await bot.loginMyAccount();
	await bot.commentOnPost('higorhaalves', 'CCThaM8nqYm');
}

init();
