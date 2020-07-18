import fs from 'fs';
import path from 'path';
import Puppeteer from 'puppeteer';

import Instagram from '@/Controllers/Instagram';
import Log from '@/Lib/Logger';

import { DEVICE, BASE_URL } from './Constants';

const CHROMIUM_OPTIONS = {
	slowMo: 60,
	headless: false,
	devtools: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	userDataDir: './user_data',
};

async function LoginIntoInsta() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS);
	const page = (await browser.pages())[0];

	await page.emulate(DEVICE);

	const insta = new Instagram(browser, page);
	await insta.login();
}

async function GetListOfUsers() {
	const browser = await Puppeteer.launch(CHROMIUM_OPTIONS);
	const page = (await browser.pages())[0];
	const insta = new Instagram(browser, page);
	const user = 'micaely_lamounier';
	const filePath = path.resolve(path.join('.', '/src', '/Database', '/Followers'), user);

	await page.emulate(DEVICE);
	await page.goto(BASE_URL);
	await insta.goToFollowersList(user);

	const lisOfUsers = await insta.getFollowersList(user);

	fs.writeFileSync(filePath, JSON.stringify(lisOfUsers));
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
	await insta.downloadPostImage('CCn199BljJt');
}

async function init() {
	await GetListOfUsers();
}

Log('INFO', 'Bot has been initialized');
init();
