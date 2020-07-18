import Chalk from 'chalk';

type IType = 'INFO' | 'DEBUG' | 'ERROR' | 'WARN';

const loggerType = {
	INFO: (message: string) => `${Chalk.bold(Chalk.cyanBright('[INFO]'))} ${message}`,
	DEBUG: (message: string) => `${Chalk.bold(Chalk.whiteBright('[DEBUG]'))} ${message}`,
	ERROR: (message: string) => `${Chalk.bold(Chalk.redBright('[ERROR]'))} ${message}`,
	WARN: (message: string) => `${Chalk.bold(Chalk.yellowBright('[WARN]'))} ${message}`,
};

const Log = (type: IType, message: string): void => {
	console.log(loggerType[type] ? loggerType[type](message) : 'Not Found');
};

export default Log;
