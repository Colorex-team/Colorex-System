import { JwtService } from '@nestjs/jwt';
import AuthenticationTokenManager from '../applications/security/AuthTokenManager';

export class JwtTokenManager extends AuthenticationTokenManager {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  // Method to create an access token (expires in 1 day)
  async createAccessToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  // Method to create a refresh token (expires in 7 days)
  async createRefreshToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  // Method to verify a refresh token
  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Method to decode the payload without verifying the token
  async decodePayload(token: string): Promise<any> {
    const decoded = this.jwtService.decode(token);
    return decoded;``
  }
}
