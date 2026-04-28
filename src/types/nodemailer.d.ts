declare module "nodemailer" {
  export function createTransport(options: any): {
    sendMail(mail: any): Promise<any>;
  };
  const _default: {
    createTransport: typeof createTransport;
  };
  export default _default;
}

