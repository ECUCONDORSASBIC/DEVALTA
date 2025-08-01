declare module 'winston-daily-rotate-file' {
  import { TransportStreamOptions } from 'winston-transport';
  import Transport from 'winston-transport';

  interface DailyRotateFileTransportOptions extends TransportStreamOptions {
    filename?: string;
    dirname?: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string | number;
    maxFiles?: string | number;
    level?: string;
  }

  export default class DailyRotateFile extends Transport {
    constructor(opts?: DailyRotateFileTransportOptions);
  }
} 