import {z} from 'zod';

export const registerSchema = z.object({
    username: z.string({
        required_error: 'Nombre de usuario es requerido',
    }).min(1, {message: 'El nombre de usuario debe tener al menos 1 caracter'}),
    password: z.string({
        required_error: 'Contraseña es requerida',
    }).min(6, {message: 'La contraseña debe tener al menos 6 caracteres'}),
})

export const loginSchema = z.object({
    username: z.string({
        required_error: 'Nombre de usuario es requerido',
    }).min(1, {message: 'Nombre de usuario incorrecto'}),
    password: z.string({
        required_error: 'Contraseña es requerida',
    }).min(6, {message: 'La contraseña debe tener al menos 6 caracteres'}),
})