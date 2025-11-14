import { BadRequestException } from "@nestjs/common";
import AuthenticationTokenManager from "../../../applications/security/AuthTokenManager";
import PasswordHash from "../../../applications/security/PasswordHash";
import { UserRepository } from "../../../domains/repositories/user/user.repository";
import { LoginDto } from "../../../presentations/auth/dto/auth.dto";

export class LoginUserUsecase {
  constructor(
    private userRepository: UserRepository,
    private authTokenManager: AuthenticationTokenManager,
    private passwordHash: PasswordHash,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.userRepository.findUser({ email: loginDto.email });
    console.log(user)
    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    const isPasswordValid = await this.passwordHash.comparePassword(
      loginDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid credentials");
    }

    const accessToken = await this.authTokenManager.createAccessToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = await this.authTokenManager.createRefreshToken({
      id: user.id,
      email: user.email,
    });


    return { accessToken, refreshToken };
  }
}
