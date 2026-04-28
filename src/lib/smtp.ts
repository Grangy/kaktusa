import net from "node:net";
import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

export async function checkTcp(host: string, port: number, timeoutMs = 6000): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host, port });
    const onFail = (err: unknown) => {
      socket.removeAllListeners();
      try {
        socket.destroy();
      } catch {}
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      socket.removeAllListeners();
      try {
        socket.end();
      } catch {}
      resolve();
    });
    socket.once("timeout", () => onFail(new Error(`SMTP TCP timeout after ${timeoutMs}ms (${host}:${port})`)));
    socket.once("error", onFail);
  });
}

export async function sendMailWithTimeout(opts: {
  smtp: SmtpConfig;
  to: string;
  subject: string;
  html: string;
  timeoutMs?: number;
}) {
  const timeoutMs = opts.timeoutMs ?? 12000;
  const { host, port, user, pass } = opts.smtp;

  // Fast fail if network/port is blocked
  await checkTcp(host, port, Math.min(6000, timeoutMs));

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: Math.min(8000, timeoutMs),
    greetingTimeout: Math.min(8000, timeoutMs),
    socketTimeout: timeoutMs,
    tls: { servername: host },
  });

  // Avoid hanging forever
  const result = await Promise.race([
    transporter.sendMail({ from: opts.smtp.from, to: opts.to, subject: opts.subject, html: opts.html }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`SMTP send timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
  return result as any;
}

