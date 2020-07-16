import fs from 'fs';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers';

import { DEVICE } from './Constants';

async function Init() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	// await insta.login();
	// await insta.navigateToUserPage();
	// await insta.navigateToFollowers();
	// const usersList = await insta.getFollowersList();
	// @ts-ignore
	// fs.appendFileSync('./src/Database/userlist.txt', usersList);

	await insta.navigateToImage();
	browser.close();
}

Init();
