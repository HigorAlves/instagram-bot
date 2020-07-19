import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const CHROMIUM_OPTIONS_PROD = {
	slowMo: 60,
	headless: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
};
const CHROMIUM_OPTIONS_DEV = {
	slowMo: 60,
	headless: false,
	devtools: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
	// userDataDir: './user_data',
};

export const DEVICE = puppeteer.devices['iPhone 6'];
export const CHROMIUM_OPTIONS = process.env.ENV === 'development' ? CHROMIUM_OPTIONS_DEV : CHROMIUM_OPTIONS_PROD;
export const INSTAGRAM_USER = process.env.INSTAGRAM_USER as string;
export const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD as string;
export const BASE_URL = 'https://www.instagram.com';
