import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@start.local',
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      throw new Error(result.error.message)
    }

    return result
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export function getPasswordResetEmailHTML(resetUrl: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinir Senha</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin: 0; }
          .content { margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Redefinir Senha</h1>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Você solicitou para redefinir sua senha. Clique no botão abaixo para continuar:</p>
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
            <p>Ou copie o link abaixo:</p>
            <p><code>${resetUrl}</code></p>
            <p>Este link expira em 1 hora.</p>
            <p>Se não solicitou a redefinição de senha, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© Start - Plataforma de RH</p>
          </div>
        </div>
      </body>
    </html>
  `
}
