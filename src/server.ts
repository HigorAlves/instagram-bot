import fs from 'fs';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers/Instagram';
import Log from '@/Lib/Logger';

import { DEVICE } from './Constants';

const CHROMIUM_OPTIONS = {
	slowMo: 60,
	headless: false,
	devtools: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

async function LoginIntoInsta() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS);
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();
}

async function GetListOfUsers() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);
	const insta = new Instagram(browser, page);
	await insta.navigateToUserPage();
	await insta.navigateToFollowers();
	const usersList = await insta.getFollowersList();
	// @ts-ignore
	fs.appendFileSync('./src/Database/userlist.txt', usersList);
	browser.close();
}

async function CommentOnPost() {
	const browser = await Puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.navigateToImage();

	const list = fs.readFileSync('./src/Database/userlist.txt', 'utf8');
	const userNames = list.split(',');
	let index = 100;

	do {
		const comment = `@${userNames[index]}`;
		const delay = Math.floor(Math.random() * (9 - 1 + 1) + 1) * 100 + Math.random() * 100 + Math.random() * 99;
		index++;
		console.log(`Tempo: ${delay} | Index: ${index} | Comment: ${comment}`);
		await page.waitFor(delay);
		await insta.commentOnPost(comment);
		await page.waitFor(9000 + Math.random() * 100);

		if (index % 20) {
			await page.waitFor(20000);
		}

		if (delay > 500 + Math.random() + 27) {
			await page.reload();
		}
	} while (index < userNames.length);
}
async function downloadPost() {
	const browser = await Puppeteer.launch();
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.downloadPostImage('https://www.instagram.com/p/CCn199BljJt/');
}

async function init() {
	Log('INFO', '🎉 Bot has been initialized');
	LoginIntoInsta();
}

init();
