import {z} from 'zod'

export const Account = z.object({
    email : z.string().email({
        message: 'الرجاء إدخال بريد إلكتروني صحيح'
    }), 
    password: z.string().min(6, {
        message: 'الرجاء إدخال كلمة مرور تتكون من 6 أحرف على الأقل'
    })
})

export type TAccount = z.infer<typeof Account>