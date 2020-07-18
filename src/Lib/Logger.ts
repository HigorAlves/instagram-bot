import Chalk from 'chalk';
import emoji from 'node-emoji';

type IType = 'INFO' | 'DEBUG' | 'ERROR' | 'WARN';

const loggerType = {
	INFO: (message: string) => `${Chalk.bold(Chalk.cyanBright('[INFO]'))} ${emoji.get('ghost')} ${message}`,
	DEBUG: (message: string) => `${Chalk.bold(Chalk.whiteBright('[DEBUG]'))} ${emoji.get('ghost')} ${message}`,
	ERROR: (message: string) => `${Chalk.bold(Chalk.redBright('[ERROR]'))} ${emoji.get('ghost')} ${message}`,
	WARN: (message: string) => `${Chalk.bold(Chalk.yellowBright('[WARN]'))} ${emoji.get('ghost')} ${message}`,
};

const Log = (type: IType, message: string): void => {
	console.log(loggerType[type] ? loggerType[type](message) : 'Not Found');
};

export default Log;
