# Mercador Landing Page Generator

A Next.js application that generates and serves dynamic landing pages for products from the Mercacio APP.

## Features

- Dynamic landing page generation
- Multi-language support
- Affiliate customization
- API-driven product management
- Template-based page rendering
- User-specific tracking URLs

## Tech Stack

- Next.js
- TypeScript
- Prisma (PostgreSQL)
- TailwindCSS
- Vercel (Deployment)

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL (or use Neon for serverless PostgreSQL)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Walidbeno/Mercador.git
cd mercador
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your database credentials and other environment variables:
```env
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-jwt-secret"
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

### API Usage

To create a landing page:

```bash
curl -X POST https://mercacio.net/api/landing-pages/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "productId": "product-uuid",
    "mercacioUserId": "user123",
    "mercacioProductId": "prod456",
    "template": "<template-content>",
    "settings": {
      "theme": "light",
      "primaryColor": "#FF5733"
    },
    "locale": "es"
  }'
```

Response:
```json
{
  "landingPage": { ... },
  "url": "https://mercacio.net/p/user123-prod456",
  "trackingId": "user123-prod456"
}
```

## Project Structure

```
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── pages/          
│   │   ├── api/        # API endpoints
│   │   └── p/          # Dynamic landing pages
│   └── lib/            # Utilities
└── public/             # Static assets
```

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Create a new project on Vercel
3. Connect your forked repository
4. Add the following environment variables in Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
5. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 