import { Page } from 'puppeteer';

async function scroll(item: string, page: Page): Promise<void> {
	await page.$eval(`${item}:last-child`, (e) => {
		e.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
	});
}

export default scroll;
