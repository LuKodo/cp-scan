import type { User, Session, LoginResponseDTO } from '../types/domain';

export const AuthMapper = {
  toUser(dto: LoginResponseDTO): User {
    return {
      id: dto.id,
      name: dto.name,
      sede: dto.sede,
      metodoFirma: dto.metodo_firma as 'FIRMA' | 'FOTO',
    };
  },

  toSession(user: User, expiresAt: number): Session {
    return {
      user,
      expiresAt,
    };
  },
};
