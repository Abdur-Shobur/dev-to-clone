import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { HashingService } from '../common/hashing/hashing.service';
import { MailerService } from '../common/mailer/mailer.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponse, TokenResponse } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Create user using user service
    const user = await this.userService.create(registerDto);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Send verification email
    await this.sendVerificationEmail(user.email, user.id);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.userService.verifyPassword(
      user.id,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return await this.generateTokens(user.id);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
    message: string;
  }> {
    const { email } = forgotPasswordDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    await this.sendPasswordResetEmail(email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
  }> {
    const { token, newPassword } = resetPasswordDto;

    // Find user with valid reset token
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    await this.userService.changePassword(user.id, '', newPassword);

    // Clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
    message: string;
  }> {
    const { token } = verifyEmailDto;

    // Find user with verification token
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{
    message: string;
  }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(email, user.id);

    return { message: 'Verification email sent' };
  }

  async logout(userId: number): Promise<{ message: string }> {
    // In a more complex implementation, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: number): Promise<TokenResponse> {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async sendVerificationEmail(email: string, userId: number) {
    const verificationToken = uuidv4();

    // Store verification token
    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken },
    });

    const verificationUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    )}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Verify your email address</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }

  private async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    )}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    });
  }
}
