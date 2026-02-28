import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(8, 'Password must have at least 8 characters')
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
