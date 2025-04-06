import { Injectable } from '@nestjs/common';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
export type LogCategory = 'auth' | 'database' | 'test' | 'request' | 'response';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  categories: LogCategory[];
  showPassingTests: boolean;
  showTimestamps: boolean;
  truncateStrings: boolean;
  truncateLength: number;
}

@Injectable()
export class TestLogger {
  private static config: LogConfig = {
    enabled: true,
    level: 'info',
    categories: ['auth', 'database', 'test'],
    showPassingTests: false,
    showTimestamps: true,
    truncateStrings: true,
    truncateLength: 50
  };

  static configure(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  static shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.includes(category)) return false;

    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'verbose'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex <= configLevelIndex;
  }

  private static formatValue(value: any): any {
    if (!value) return value;

    if (typeof value === 'string' && this.config.truncateStrings) {
      return value.length > this.config.truncateLength 
        ? value.substring(0, this.config.truncateLength) + '...'
        : value;
    }

    if (typeof value === 'object') {
      const formatted = { ...value };
      for (const key in formatted) {
        if (typeof formatted[key] === 'string') {
          formatted[key] = this.formatValue(formatted[key]);
        }
      }
      return formatted;
    }

    return value;
  }

  private static getTimestamp(): string {
    return this.config.showTimestamps 
      ? `[${new Date().toISOString()}] `
      : '';
  }

  static error(message: string, data?: any, category: LogCategory = 'test') {
    if (this.shouldLog('error', category)) {
      console.error(`${this.getTimestamp()}❌ ERROR [${category}]: ${message}`, data ? this.formatValue(data) : '');
    }
  }

  static warn(message: string, data?: any, category: LogCategory = 'test') {
    if (this.shouldLog('warn', category)) {
      console.warn(`${this.getTimestamp()}⚠️ WARN [${category}]: ${message}`, data ? this.formatValue(data) : '');
    }
  }

  static info(message: string, data?: any, category: LogCategory = 'test') {
    if (this.shouldLog('info', category)) {
      console.log(`${this.getTimestamp()}ℹ️ INFO [${category}]: ${message}`, data ? this.formatValue(data) : '');
    }
  }

  static debug(message: string, data?: any, category: LogCategory = 'test') {
    if (this.shouldLog('debug', category)) {
      console.log(`${this.getTimestamp()}🔍 DEBUG [${category}]: ${message}`, data ? this.formatValue(data) : '');
    }
  }

  static verbose(message: string, data?: any, category: LogCategory = 'test') {
    if (this.shouldLog('verbose', category)) {
      console.log(`${this.getTimestamp()}📝 VERBOSE [${category}]: ${message}`, data ? this.formatValue(data) : '');
    }
  }

  static testPass(testName: string, data?: any) {
    if (this.config.showPassingTests) {
      console.log(`${this.getTimestamp()}✅ PASS: ${testName}`, data ? this.formatValue(data) : '');
    }
  }

  static testFail(testName: string, error: any) {
    console.error(`${this.getTimestamp()}❌ FAIL: ${testName}`, error);
  }

  static testSkip(testName: string, reason?: string) {
    console.log(`${this.getTimestamp()}⏭️ SKIP: ${testName}${reason ? ` (${reason})` : ''}`);
  }

  static groupStart(name: string) {
    console.group(`${this.getTimestamp()}📑 ${name}`);
  }

  static groupEnd() {
    console.groupEnd();
  }
} 