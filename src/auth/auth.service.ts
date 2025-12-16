import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditProfileDto } from './dto/edit-profile.dto';
import { CreateAvatarDto } from './dto/create-avatar.dto';

@Injectable()
export class AuthService {
  private readonly baseDir = path.join(__dirname, '..', '..', '_partial');
  private readonly generatedDir = path.join(__dirname, '..', '..', 'uploads');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(authDto: AuthDto) {
    const { email, password } = authDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const userCount = (await this.userRepository.count()) + 1;
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      loginType: 'email',
      nickname: '익명' + userCount,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }

      throw new InternalServerErrorException(
        '회원가입 도중 에러가 발생했습니다.',
      );
    }
  }

  private async getTokens(payload: { email: string }) {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
      }),
    ]);

    return { accessToken };
  }

  async signin(authDto: AuthDto) {
    const { email, password, expoPushToken } = authDto;
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const { accessToken } = await this.getTokens({ email });

    if (expoPushToken) {
      const profile = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId: user.id })
        .getOne();
      profile.expoPushToken = expoPushToken;
      await this.userRepository.save(profile);
    }

    return { accessToken };
  }

  getProfile(user: User) {
    const {
      loginType,
      password,
      expoPushToken,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = user;

    return rest;
  }

  async getPushToken(userId: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });

    return user.expoPushToken;
  }

  private async createAvatar(createAvatarDto: CreateAvatarDto) {
    const outputFileName = `output-${uuidv4()}.png`;
    const outputPath = path.join(this.generatedDir, outputFileName);
    const compositeArray = [{ input: path.join(this.baseDir, 'line.svg') }];

    if (createAvatarDto.skinId) {
      compositeArray.unshift({
        input: path.join(this.baseDir, `/skins/${createAvatarDto.skinId}.svg`),
      });
    }
    if (createAvatarDto.handId) {
      compositeArray.push({
        input: path.join(this.baseDir, `/hands/${createAvatarDto.handId}.png`),
      });
    }
    if (createAvatarDto.bottomId) {
      compositeArray.push({
        input: path.join(
          this.baseDir,
          `/bottoms/${createAvatarDto.bottomId}.svg`,
        ),
      });
    }
    if (createAvatarDto.topId) {
      compositeArray.push({
        input: path.join(this.baseDir, `/tops/${createAvatarDto.topId}.svg`),
      });
    }
    if (createAvatarDto.faceId) {
      compositeArray.push({
        input: path.join(this.baseDir, `/faces/${createAvatarDto.faceId}.svg`),
      });
    }
    if (createAvatarDto.hatId) {
      compositeArray.push({
        input: path.join(this.baseDir, `/hats/${createAvatarDto.hatId}.svg`),
      });
    }

    await sharp({
      create: {
        width: 230,
        height: 230,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite(compositeArray)
      .png()
      .toFile(outputPath);

    return outputFileName;
  }

  async editProfile(editProfileDto: EditProfileDto, user: User) {
    const profile = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();

    if (!profile) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const {
      nickname,
      imageUri,
      introduce,
      hatId,
      handId,
      skinId,
      topId,
      bottomId,
      faceId,
      background,
    } = editProfileDto;

    if (nickname) {
      const existingUser = await this.userRepository
        .createQueryBuilder('user')
        .where('user.nickname = :nickname', { nickname })
        .andWhere('user.id != :userId', { userId: user.id })
        .getOne();

      profile.nickname = nickname;

      if (existingUser) {
        throw new BadRequestException('이미 사용 중인 닉네임입니다.');
      }
    }
    if (
      (hatId && profile.hatId !== hatId) ||
      (handId && profile.handId !== handId) ||
      (skinId && profile.skinId !== skinId) ||
      (topId && profile.topId !== topId) ||
      (bottomId && profile.bottomId !== bottomId) ||
      (faceId && profile.faceId !== faceId)
    ) {
      const avatarUri = await this.createAvatar({
        hatId,
        handId,
        skinId,
        topId,
        bottomId,
        faceId,
      });

      profile.imageUri = avatarUri;
    }
    if (introduce) {
      profile.introduce = introduce;
    }
    if (hatId) {
      profile.hatId = hatId;
    }
    if (skinId) {
      profile.skinId = skinId;
    }
    if (handId) {
      profile.handId = handId;
    }
    if (topId) {
      profile.topId = topId;
    }
    if (bottomId) {
      profile.bottomId = bottomId;
    }
    if (faceId) {
      profile.faceId = faceId;
    }
    if (background) {
      profile.background = background;
    }

    try {
      await this.userRepository.save(profile);

      const { loginType, password, ...rest } = profile;
      return rest;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '프로필 수정 도중 에러가 발생했습니다.',
      );
    }
  }

  async getUserProfile(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    const {
      loginType,
      password,
      expoPushToken,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = user;

    return rest;
  }
}
