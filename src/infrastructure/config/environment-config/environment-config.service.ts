import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../../domains/config/database.interface';

@Injectable()
export class EnvironmentConfigService implements DatabaseConfig {
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  getDatabaseHost(): string {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_HOST')
      : this.configService.get<string>('DATABASE_HOST');
  }

  getDatabasePort(): number {
    return this.isProduction
      ? Number(this.configService.get<number>('DATABASE_PROD_PORT'))
      : Number(this.configService.get<number>('DATABASE_PORT'));
  }

  getDatabaseUser(): string {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_USER')
      : this.configService.get<string>('DATABASE_USER');
  }

  getDatabasePassword(): string {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_PASSWORD')
      : this.configService.get<string>('DATABASE_PASSWORD');
  }

  getDatabaseName(): string {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_NAME')
      : this.configService.get<string>('DATABASE_NAME');
  }

  getDatabaseSchema(): string {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_SCHEMA')
      : this.configService.get<string>('DATABASE_SCHEMA');
  }

  getDatabaseSync(): boolean {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_SYNCHRONIZE') === 'true'
      : this.configService.get<string>('DATABASE_SYNCHRONIZE') === 'true';
  }

  getMigrationsRun(): boolean {
    return this.isProduction
      ? this.configService.get<string>('DATABASE_PROD_MIGRATIONS_RUN') === 'true'
      : false;
  }

  getFirebaseCredentialJson() : string {
    return this.isProduction 
      ? this.configService.get<string>("FIREBASE_PROD_CREDENTIALS")
      : this.configService.get<string>("FIREBASE_CREDENTIALS") ;
  }

  getFirebaseStorageBucket() : string {
    return this.isProduction 
      ? this.configService.get<string>("FIREBASE_PROD_STORAGE")
      : this.configService.get<string>("FIREBASE_STORAGE") ;
  }
}
