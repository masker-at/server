import { FastifyInstance } from 'fastify';
import PostalAPI from '@masker-at/postal-api';
import { Alias } from '@masker-at/postgres-models';
import decorateEmail, { IncomingEmail } from '../utils/decorateEmail';

// const MAX_STORED_MESSAGE_SIZE = 3 * 1024 * 1024; // 3 MB
const MAX_FORWARDED_MESSAGE_SIZE = 50 * 1024 * 1024; // 50 MB

const postalAPI = new PostalAPI(process.env.POSTAL_API_BASE_URL!, process.env.POSTAL_API_KEY!);

export default async function emailRoute(app: FastifyInstance): Promise<void> {
  app.post<{ Body: IncomingEmail }>('/email', async (req, res) => {
    if (Number(req.body.size) > MAX_FORWARDED_MESSAGE_SIZE) {
      await res.status(500).send('Message too large');
      return;
    }

    const alias = await Alias.findOne({ address: req.body.rcpt_to }, { relations: ['user'] });
    if (!alias || !alias.user) {
      await res.status(500).send('No such address');
      return;
    }

    await res.send('OK'); // Send response to Postal to avoid timeouts

    const { html, text, subject } = decorateEmail(req.body, alias);

    await postalAPI.sendMessage({
      subject,
      htmlBody: html || undefined,
      plainBody: text,
      attachments: req.body.attachments.map(
        ({ filename: fileName, content_type: contentType, data }) => ({
          fileName,
          contentType,
          data: Buffer.from(data, 'base64'),
        }),
      ),
      to: [alias.user.email],
      from: 'forward@masker.at',
    });
  });
}
